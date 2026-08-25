import { getPayload } from 'payload';
import configPromise from '../src/payload.config';
import { Client } from 'pg';

// Manual Overrides Mapping
const overrides: Record<string, string> = {
  'Semax + Selank Blend Spray': 'Semax + Selank Spray',
  'Melanotan-2': 'MT-2 10mg (Melanotan II)',
  'Melanotan-1': 'MT-1 10mg (Melanotan)',
  'CJC-1295 with DAC': 'CJC-1295 W DAC 5mg',
  'Epitalon': 'Epithalon ',
};

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
  const ppVariantsRaw = variantsResult.rows;

  // Group variants so we can check ALL labels for a single variant
  const groupedVariants = new Map<string, any>();
  for (const row of ppVariantsRaw) {
    const vid = String(row.variant_id);
    if (!groupedVariants.has(vid)) {
      groupedVariants.set(vid, {
        product_id: String(row.product_id),
        variant_id: vid,
        price: row.price,
        sale_price: row.sale_price,
        options: []
      });
    }
    const v = groupedVariants.get(vid);
    if (row.option_value) {
      v.options.push(row.option_value.toLowerCase());
    }
  }

  let updateCount = 0;

  for (const hb of hbProducts) {
    if (hb.name === 'L-Carnitine') {
      continue;
    }

    let ppTargetName = hb.name;
    
    // Exact Manual Overrides for Product Name
    if (overrides[hb.name]) {
      ppTargetName = overrides[hb.name];
    } else if (hb.name === 'Ipamorelin') {
      ppTargetName = 'Ipamorelin';
    } else if (hb.name === 'NAD+') {
      ppTargetName = 'NAD+';
    }

    const hbNameSearch = ppTargetName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hbSlugSearch = hb.slug?.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // STRICT MATCH FIRST
    let matchedPP = ppProducts.find(pp => {
      const ppName = pp.product_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (hb.name === 'Ipamorelin' && pp.product_name !== 'Ipamorelin') return false;
      if (hb.name === 'NAD+' && pp.product_name !== 'NAD+') return false;
      return ppName === hbNameSearch || ppName === hbSlugSearch;
    });

    // FALLBACK PARTIAL MATCH
    if (!matchedPP) {
      matchedPP = ppProducts.find(pp => {
        const ppName = pp.product_name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (hb.name === 'Ipamorelin' && pp.product_name !== 'Ipamorelin') return false;
        if (hb.name === 'NAD+' && pp.product_name !== 'NAD+') return false;
        return hbNameSearch && ppName.includes(hbNameSearch);
      });
    }
    if (!matchedPP) {
      matchedPP = ppProducts.find(pp => {
        const ppName = pp.product_name.toLowerCase();
        if (hb.name === 'Ipamorelin' && pp.product_name !== 'Ipamorelin') return false;
        if (hb.name === 'NAD+' && pp.product_name !== 'NAD+') return false;
        return ppName.includes(ppTargetName.toLowerCase()) || ppTargetName.toLowerCase().includes(ppName);
      });
    }

    if (!matchedPP) continue;

    // Filter variants for THIS product, and completely exclude any variant that has 'kit' in ANY of its options
    let ppProdVariants = Array.from(groupedVariants.values()).filter(v => {
      if (v.product_id !== String(matchedPP.product_id)) return false;
      
      const hasKit = v.options.some((opt: string) => opt.includes('kit'));
      if (hasKit) return false; // Reject the entire variant

      return true;
    });

    let basePriceStr = matchedPP.price ? parseFloat(matchedPP.price) : 0;
    let baseSaleStr = matchedPP.sale_price ? parseFloat(matchedPP.sale_price) : 0;

    let newHbPrice = Math.ceil(basePriceStr * 1.1);
    let newHbSalePrice = baseSaleStr ? Math.ceil(baseSaleStr * 1.1) : null;
    let updatedVariants = [];
    
    let shouldUpdate = false;

    if (hb.hasVariants && hb.variants && hb.variants.length > 0) {
      updatedVariants = hb.variants.map((hbV: any) => {
        let vTitle = hbV.options?.[0]?.value?.toLowerCase() || hbV.sku?.toLowerCase() || '';
        
        let targetVariantTitle = vTitle;
        // Manual Variant Overrides
        if (hb.name === 'Tesamorelin + Ipamorelin Blend' && vTitle === '6.3mg') targetVariantTitle = '6mg/3mg';
        if (hb.name === 'Tesamorelin + Ipamorelin Blend' && vTitle === '13mg') targetVariantTitle = '13mg/3mg';
        if (hb.name === 'CJC-1295 / Ipamorelin' && vTitle === '5mg/5mg') targetVariantTitle = '5/5mg';
        
        let matchedPPV = ppProdVariants.find(v => {
          return v.options.some((opt: string) => opt.includes(targetVariantTitle) || targetVariantTitle.includes(opt));
        });

        // Some PP products only use 'Single'
        if (!matchedPPV) {
           matchedPPV = ppProdVariants.find(v => {
             return v.options.some((opt: string) => opt.includes('single'));
           });
        }

        let pPrice = basePriceStr;
        let pSale = baseSaleStr;
        
        if (matchedPPV) {
          pPrice = matchedPPV.price ? parseFloat(matchedPPV.price) : basePriceStr;
          pSale = matchedPPV.sale_price ? parseFloat(matchedPPV.sale_price) : baseSaleStr;
        } else if (ppProdVariants.length === 1 && hb.variants.length === 1) {
          pPrice = ppProdVariants[0].price ? parseFloat(ppProdVariants[0].price) : basePriceStr;
          pSale = ppProdVariants[0].sale_price ? parseFloat(ppProdVariants[0].sale_price) : baseSaleStr;
        }

        const vNewPrice = Math.ceil(pPrice * 1.1);
        const vNewSale = pSale ? Math.ceil(pSale * 1.1) : null;

        return {
          ...hbV,
          price: vNewPrice,
          salePrice: vNewSale
        };
      });
      shouldUpdate = true;
    } else {
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      const updateData: any = {
        price: newHbPrice,
        salePrice: newHbSalePrice
      };
      if (hb.hasVariants && updatedVariants.length > 0) {
        updateData.variants = updatedVariants;
      }

      await payload.update({
        collection: 'products',
        id: hb.id,
        data: updateData
      });
      
      console.log(`Updated ${hb.name} (Base Price: $${newHbPrice})`);
      updateCount++;
    }
  }

  await client.end();
  
  console.log(`\n=== Migration Complete ===`);
  console.log(`Successfully updated ${updateCount} products in Helix Bio DB with strict matching.`);
  
  process.exit(0);
}

run().catch(console.error);
