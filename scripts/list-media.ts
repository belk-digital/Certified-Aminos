import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '../src/payload.config';
import fs from 'fs';

async function run() {
  const p = await getPayload({ config: configPromise });

  const m = await p.find({ collection: 'media', limit: 1000 });
  fs.writeFileSync('media-utf8.txt', m.docs.map(d => d.filename).join('\n'), 'utf8');

  process.exit(0);
}
run().catch(console.error);
