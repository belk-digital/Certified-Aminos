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
  
  // Find products in this category
  const products = await p.find({
    collection: 'products',
    limit: 1000,
  });
  
  const inCat = products.docs.filter((prod: any) => {
      const catIds = (prod.categories || []).map((c: any) => (typeof c === 'object' ? c.id : c));
      return catIds.includes(cat.id);
  });
  
  console.log(`\nProducts assigned to this category (${inCat.length}):`);
  inCat.forEach(prod => console.log(`- ${prod.title}`));
  
  process.exit(0);
}

run().catch(console.error);
