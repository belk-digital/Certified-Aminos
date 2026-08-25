import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.tpukpnpdehbtlqhnffpb:Cx5fRufd3NVxOny5@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
  });
  
  await client.connect();
  console.log('Connected to 99 Purity Peptides DB!');
  
  // Find all tables that might contain product info or variants
  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (table_name LIKE '%product%' OR table_name LIKE '%variant%');
  `);
  
  console.log('Relevant tables:', tables.rows.map(r => r.table_name));

  // Inspect products table columns
  if (tables.rows.some(r => r.table_name === 'products')) {
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `);
    console.log('Products columns:', columns.rows);
    
    // get a sample product
    const sample = await client.query(`SELECT * FROM products LIMIT 1`);
    console.log('Sample product keys:', Object.keys(sample.rows[0] || {}));
  }
  
  // If there's a products_variants or similar table, inspect it
  const variantTable = tables.rows.find(r => r.table_name.includes('variant'));
  if (variantTable) {
    const vColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1;
    `, [variantTable.table_name]);
    console.log(variantTable.table_name + ' columns:', vColumns.rows);
  }

  await client.end();
}

run().catch(console.error);
