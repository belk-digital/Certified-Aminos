import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

async function run() {
  const p = await getPayload({ config: configPromise });
  const c = await p.find({ collection: 'categories', limit: 100 });
  console.log('Local Categories:', c.docs.map((x: any) => x.slug));
  process.exit(0);
}

run();
