import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

async function run() {
  const p = await getPayload({ config: configPromise });

  const products = await p.find({
    collection: 'products',
    limit: 1000,
    depth: 1
  });

  for (const prod of products.docs) {
    if (prod.hasVariants && prod.variants) {
      console.log(`Product: ${prod.slug}`);
      for (const v of prod.variants) {
        const optionStr = v.options?.map((o:any) => o.value).join(', ');
        const imageStr = v.images?.length > 0 && v.images[0].image ? v.images[0].image.filename : 'NO IMAGE';
        console.log(`  - Variant ${optionStr}: ${imageStr}`);
      }
    }
  }

  process.exit(0);
}
run().catch(console.error);
