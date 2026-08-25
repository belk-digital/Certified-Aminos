import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.tpukpnpdehbtlqhnffpb:Cx5fRufd3NVxOny5@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
  });
  
  await client.connect();
  console.log('Connected to 99 Purity Peptides DB!');
  
  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (table_name LIKE '%categories%' OR table_name LIKE '%products%');
  `);
  
  console.log('Tables found:', tables.rows.map(r => r.table_name));
  
  await client.end();
}

run().catch(console.error);
