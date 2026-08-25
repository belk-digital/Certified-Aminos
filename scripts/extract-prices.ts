import { Client } from 'pg';
import fs from 'fs';

async function run() {
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
    ORDER BY pl.name ASC
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

  const products = productsResult.rows;
  const variants = variantsResult.rows;

  let markdown = '# 99 Purity Peptides - Product Pricing\n\n';
  markdown += '| Product | Base Price | Sale Price | Variants |\n';
  markdown += '|---------|------------|------------|----------|\n';

  for (const p of products) {
    const pVariants = variants.filter(v => String(v.product_id) === String(p.product_id));
    
    let baseStr = p.price ? `$${p.price}` : '-';
    let saleStr = p.sale_price ? `$${p.sale_price}` : '-';
    
    let variantStr = '';
    if (p.has_variants && pVariants.length > 0) {
      variantStr = pVariants.map(v => {
        const vPrice = v.price ? `$${v.price}` : baseStr;
        const vSale = v.sale_price ? `$${v.sale_price}` : saleStr;
        return `**${v.option_value}**: ${vSale !== '-' ? `~~${vPrice}~~ ${vSale}` : vPrice}`;
      }).join('<br/>');
    } else {
      variantStr = 'No variants';
    }

    markdown += `| **${p.product_name}** | ${baseStr} | ${saleStr} | ${variantStr} |\n`;
  }

  const outPath = 'C:/Users/aquib/.gemini/antigravity-ide/brain/3935d83d-486e-45ba-aac0-638d4f213e5c/product_prices.md';
  fs.writeFileSync(outPath, markdown);
  console.log('Saved prices to artifact.');

  await client.end();
}

run().catch(console.error);
