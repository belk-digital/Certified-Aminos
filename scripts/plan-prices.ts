import { getPayload } from 'payload';
import configPromise from '../src/payload.config';
import { Client } from 'pg';

async function run() {
  const payload = await getPayload({ config: configPromise });
  const hbProductsRes = await payload.find({
    collection: 'products',
    limit: 1000,
    depth: 0
  });
  const hbProducts = hbProductsRes.docs;

  const client = new Client({
    connectionString: 'postgresql://postgres.tpukpnpdehbtlqhnffpb:Cx5fRufd3NVxOny5@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
  });
  await client.connect();

  const productsResult = await client.query(`
    SELECT 
      p.id as product_id, 
      pl.name as product_name, 
      p.price, 
      p.sale_price, 
      p.has_variants
    FROM products p
    LEFT JOIN products_locales pl ON p.id = pl._parent_id AND pl._locale = 'en'
    WHERE p.status = 'active' OR p.status IS NULL
  `);
  
  const variantsResult = await client.query(`
    SELECT 
      pv._parent_id as product_id,
      pv.id as variant_id,
      pv.price,
      pv.sale_price,
      pvo.value as option_value
    FROM products_variants pv
    LEFT JOIN products_variants_options pvo ON pv.id = pvo._parent_id
  `);
  
  const ppProducts = productsResult.rows;
  const ppVariants = variantsResult.rows;

  let confusingProducts = [];
  let matchingPlan = [];

  for (const hb of hbProducts) {
    // try to match by name or similar slug
    const hbName = hb.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hbSlug = hb.slug?.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let matchedPP = ppProducts.find(pp => {
      const ppName = pp.product_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return ppName === hbName || ppName === hbSlug || (hbName && ppName.includes(hbName));
    });

    if (!matchedPP) {
      // try to find by some substring
      matchedPP = ppProducts.find(pp => {
        const ppName = pp.product_name.toLowerCase();
        return ppName.includes(hb.name.toLowerCase()) || hb.name.toLowerCase().includes(ppName);
      });
    }

    if (!matchedPP) {
      confusingProducts.push({ hbName: hb.name, reason: 'Could not find a matching product in 99 Purity DB' });
      continue;
    }

    // Match Variants
    const ppProdVariants = ppVariants.filter(v => String(v.product_id) === String(matchedPP.product_id) && !v.option_value?.toLowerCase().includes('kit'));
    
    let basePriceStr = matchedPP.price ? parseFloat(matchedPP.price) : 0;
    let baseSaleStr = matchedPP.sale_price ? parseFloat(matchedPP.sale_price) : 0;

    let variantMatches = [];
    let hasConfusion = false;

    if (hb.hasVariants && hb.variants && hb.variants.length > 0) {
      for (const hbV of hb.variants) {
        let vTitle = '';
        if (hbV.options && hbV.options.length > 0) vTitle = hbV.options[0].value.toLowerCase();
        else if (hbV.sku) vTitle = hbV.sku.toLowerCase();
        
        // Find matching variant in PP
        const matchedPPV = ppProdVariants.find(v => {
          const opt = v.option_value?.toLowerCase() || '';
          return opt.includes(vTitle) || vTitle.includes(opt);
        });

        if (matchedPPV) {
          const oldP = hbV.price;
          const oldS = hbV.salePrice;
          
          let pPrice = matchedPPV.price ? parseFloat(matchedPPV.price) : basePriceStr;
          let pSale = matchedPPV.sale_price ? parseFloat(matchedPPV.sale_price) : baseSaleStr;
          
          // increase by 10% and round to nearest whole number or 2 decimal places
          let newPrice = Math.ceil(pPrice * 1.1);
          let newSale = pSale ? Math.ceil(pSale * 1.1) : null;
          
          variantMatches.push({
            variantName: hbV.options?.[0]?.value || hbV.sku,
            oldPrice: oldP,
            oldSalePrice: oldS,
            newPrice,
            newSale
          });
        } else {
          // No match found for this variant
          if (ppProdVariants.length === 1 && hb.variants.length === 1) {
            // Assume 1:1 match
            const v = ppProdVariants[0];
            let pPrice = v.price ? parseFloat(v.price) : basePriceStr;
            let pSale = v.sale_price ? parseFloat(v.sale_price) : baseSaleStr;
            let newPrice = Math.ceil(pPrice * 1.1);
            let newSale = pSale ? Math.ceil(pSale * 1.1) : null;
            variantMatches.push({
              variantName: hbV.options?.[0]?.value || hbV.sku,
              oldPrice: hbV.price,
              oldSalePrice: hbV.salePrice,
              newPrice,
              newSale,
              note: 'Matched by elimination (1 variant each)'
            });
          } else if (!matchedPP.has_variants) {
            // HB has variants, but PP doesn't. 
            // Just use the PP base price.
            let newPrice = Math.ceil(basePriceStr * 1.1);
            let newSale = baseSaleStr ? Math.ceil(baseSaleStr * 1.1) : null;
            variantMatches.push({
              variantName: hbV.options?.[0]?.value || hbV.sku,
              oldPrice: hbV.price,
              oldSalePrice: hbV.salePrice,
              newPrice,
              newSale,
              note: 'PP has no variants, used base price'
            });
          } else {
            hasConfusion = true;
            confusingProducts.push({
              hbName: hb.name,
              reason: `Could not match variant "${vTitle}" with PP variants: ${ppProdVariants.map(v => v.option_value).join(', ')}`
            });
          }
        }
      }
    } else {
      // HB has no variants
      let newPrice = Math.ceil(basePriceStr * 1.1);
      let newSale = baseSaleStr ? Math.ceil(baseSaleStr * 1.1) : null;
      matchingPlan.push({
        hbName: hb.name,
        oldPrice: hb.price,
        oldSalePrice: hb.salePrice,
        newPrice,
        newSale
      });
    }

    if (!hasConfusion && hb.hasVariants) {
      matchingPlan.push({
        hbName: hb.name,
        isVariantMatch: true,
        variants: variantMatches
      });
    }
  }

  await client.end();
  
  console.log('=== CONFUSING PRODUCTS / MISMATCHES ===');
  console.dir(confusingProducts, { depth: null });
  
  console.log('\n=== MATCHING PLAN (First 5 examples) ===');
  console.dir(matchingPlan.slice(0, 5), { depth: null });
  
  process.exit(0);
}

run().catch(console.error);
