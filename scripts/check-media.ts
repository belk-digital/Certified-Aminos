import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

async function run() {
  const p = await getPayload({ config: configPromise });

  const products = await p.find({
    collection: 'products',
    limit: 1000,
  });

  const media = await p.find({
    collection: 'media',
    limit: 1000,
  });

  console.log(`Found ${products.totalDocs} products and ${media.totalDocs} media files.`);

  for (const m of media.docs.slice(0, 5)) {
    console.log(`Media: ${m.filename}`);
  }

  process.exit(0);
}
run().catch(console.error);
