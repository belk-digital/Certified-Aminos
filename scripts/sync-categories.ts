import { Client } from 'pg';
import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

async function run() {
  const payload = await getPayload({ config: configPromise });

  const client = new Client({
    connectionString: 'postgresql://postgres.tpukpnpdehbtlqhnffpb:Cx5fRufd3NVxOny5@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
  });
  
  await client.connect();
  console.log('Connected to 99 Purity Peptides DB!');
  
  // Get all categories from 99
  const categoriesRes = await client.query(`SELECT id, slug FROM categories`);
  const categoriesMap = new Map();
  categoriesRes.rows.forEach(r => categoriesMap.set(r.id, r.slug));

  // Get all products from 99
  const productsRes = await client.query(`SELECT id, slug FROM products`);
  const productsMap = new Map();
  productsRes.rows.forEach(r => productsMap.set(r.id, r.slug));
  
  // Get all relations from 99
  const relsRes = await client.query(`SELECT parent_id, categories_id FROM products_rels WHERE path = 'categories'`);
  
  console.log(`Found ${relsRes.rows.length} product-category relationships in 99 DB.`);

  // Group relations by remote product slug
  const remoteProductToCatSlugs = new Map<string, string[]>();
  
  for (const row of relsRes.rows) {
    const pSlug = productsMap.get(row.parent_id);
    const cSlug = categoriesMap.get(row.categories_id);
    
    if (pSlug && cSlug) {
      if (!remoteProductToCatSlugs.has(pSlug)) {
        remoteProductToCatSlugs.set(pSlug, []);
      }
      remoteProductToCatSlugs.get(pSlug)!.push(cSlug);
    }
  }

  // Now, fetch local categories and products
  const localCats = await payload.find({ collection: 'categories', limit: 1000 });
  const localCatsMap = new Map<string, any>(); // slug -> category doc
  localCats.docs.forEach(c => localCatsMap.set(c.slug as string, c));
  
  const localProducts = await payload.find({ collection: 'products', limit: 1000 });
  
  let updateCount = 0;

  for (const prod of localProducts.docs) {
    const localSlug = prod.slug as string;
    
    // Find matching remote slug
    let remoteMatch = null;
    if (remoteProductToCatSlugs.has(localSlug)) {
        remoteMatch = localSlug;
    } else {
        // Try fuzzy match
        for (const rSlug of remoteProductToCatSlugs.keys()) {
            if (rSlug.startsWith(localSlug + '-') || localSlug.startsWith(rSlug + '-')) {
                remoteMatch = rSlug;
                break;
            }
        }
    }
    
    if (remoteMatch) {
      const targetCatSlugs = remoteProductToCatSlugs.get(remoteMatch)!;
      const targetCatIds = targetCatSlugs.map(s => localCatsMap.get(s)?.id).filter(id => id);
      
      const currentCatIds = (prod.categories || []).map((c: any) => (typeof c === 'object' ? c.id : c));
      
      // Check if they are exactly the same
      const sortedTarget = [...targetCatIds].sort();
      const sortedCurrent = [...currentCatIds].sort();
      
      if (JSON.stringify(sortedTarget) !== JSON.stringify(sortedCurrent)) {
        console.log(`Updating product ${localSlug} (matched remote: ${remoteMatch}) with categories: ${targetCatSlugs.join(', ')}`);
        await payload.update({
          collection: 'products',
          id: prod.id,
          data: {
            categories: targetCatIds
          }
        });
        updateCount++;
      }
    } else {
        console.log(`Could not find a remote mapping for local product: ${localSlug}`);
    }
  }

  console.log(`Updated ${updateCount} products to match 99 Purity Peptides categories!`);
  
  await client.end();
  process.exit(0);
}

run().catch(console.error);
