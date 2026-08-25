import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.tpukpnpdehbtlqhnffpb:Cx5fRufd3NVxOny5@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
  });
  
  await client.connect();
  
  const pLocales = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products_locales'`);
  console.log('products_locales columns:', pLocales.rows.map(r => r.column_name));

  const pVariants = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products_variants'`);
  console.log('products_variants columns:', pVariants.rows.map(r => r.column_name));

  const vOptions = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products_variants_options'`);
  console.log('products_variants_options columns:', vOptions.rows.map(r => r.column_name));

  await client.end();
}

run().catch(console.error);
