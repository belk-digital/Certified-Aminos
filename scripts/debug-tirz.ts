import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

async function run() {
  const p = await getPayload({ config: configPromise });
  const c = await p.find({ collection: 'products', where: { slug: { equals: 'tirzepatide' } } });
  const m = await p.find({ collection: 'media', limit: 1000 });
  const prod = c.docs[0];
  const prodMedia = m.docs.filter(d => d.filename.toLowerCase().includes('tirz'));
  console.log('Found media:', prodMedia.map(d=>d.filename));
  prod.variants.forEach((v: any) => {
    const sizeOption = v.options.map((o:any)=>o.value.toLowerCase().replace(/\s+/g,'')).find((opt: string) => opt.includes('mg'));
    console.log('Variant size:', sizeOption);
    const match = prodMedia.find(m => m.filename.toLowerCase().replace(/\s+/g,'').includes(sizeOption));
    console.log('Matched:', match?.filename || 'None');
  });
  process.exit(0);
}
run();
