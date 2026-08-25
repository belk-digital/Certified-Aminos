import { getPayload } from 'payload';
import configPromise from '../src/payload.config';
import { Client } from 'pg';

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

  let fixes = [];

  for (const hb of hbProducts) {
    if (hb.name === 'L-Carnitine') continue;

    let ppTargetName = hb.name;
    if (overrides[hb.name]) ppTargetName = overrides[hb.name];
    else if (hb.name === 'Ipamorelin') ppTargetName = 'Ipamorelin';
    else if (hb.name === 'NAD+') ppTargetName = 'NAD+';

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

    let ppProdVariants = Array.from(groupedVariants.values()).filter(v => {
      if (v.product_id !== String(matchedPP.product_id)) return false;
      const hasKit = v.options.some((opt: string) => opt.includes('kit'));
      if (hasKit) return false;
      return true;
    });

    let basePriceStr = matchedPP.price ? parseFloat(matchedPP.price) : 0;
    let newHbPrice = Math.ceil(basePriceStr * 1.1);

    if (hb.price !== newHbPrice) {
      fixes.push({
        product: hb.name,
        currentPrice: hb.price,
        newPrice: newHbPrice,
        matchedWith: matchedPP.product_name
      });
    }
  }

  await client.end();
  
  console.log(JSON.stringify(fixes, null, 2));
  process.exit(0);
}

run().catch(console.error);
