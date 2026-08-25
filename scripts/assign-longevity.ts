import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

async function run() {
  const p = await getPayload({ config: configPromise });
  
  // Find category
  const cats = await p.find({
    collection: 'categories',
    where: { name: { like: 'Longevity' } }
  });
  
  if (cats.docs.length === 0) {
    console.log('Category not found');
    process.exit(0);
  }
  
  const cat = cats.docs[0];
  console.log(`Found Category: ${cat.name} (ID: ${cat.id})`);
  
  const longevityKeywords = ['epitalon', 'ghk', 'ahk', 'nad', 'glutathione', 'ss-31', 'mots-c'];
  
  // Find products in this category
  const products = await p.find({
    collection: 'products',
    limit: 1000,
  });
  
  let updatedCount = 0;

  for (const prod of products.docs) {
    const isLongevity = longevityKeywords.some(kw => (prod.title || prod.name || prod.slug)?.toLowerCase().includes(kw));
    
    if (isLongevity) {
        const catIds = (prod.categories || []).map((c: any) => (typeof c === 'object' ? c.id : c));
        if (!catIds.includes(cat.id)) {
            catIds.push(cat.id);
            console.log(`Adding ${prod.title || prod.slug} to ${cat.name}`);
            await p.update({
                collection: 'products',
                id: prod.id,
                data: {
                    categories: catIds
                }
            });
            updatedCount++;
        }
    }
  }
  
  console.log(`Updated ${updatedCount} products!`);
  process.exit(0);
}

run().catch(console.error);
