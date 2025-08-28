const { Pool } = require('pg')

const pool = new Pool({
  host: '3.17.236.162',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SehomeGraduation2026!',
  ssl: { rejectUnauthorized: false }
})

async function fixPermissions() {
  const client = await pool.connect()
  
  try {
    console.log('Fixing client_accounts table permissions...')
    
    // Enable RLS on the table
    await client.query(`
      ALTER TABLE client_accounts ENABLE ROW LEVEL SECURITY;
    `)
    console.log('✅ Enabled Row Level Security')
    
    // Create policy to allow all operations for authenticated users
    await client.query(`
      DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON client_accounts;
    `)
    
    await client.query(`
      CREATE POLICY "Allow all operations for authenticated users" 
      ON client_accounts 
      FOR ALL 
      TO authenticated 
      USING (true) 
      WITH CHECK (true);
    `)
    console.log('✅ Created policy for authenticated users')
    
    // Also allow for anon users (for testing)
    await client.query(`
      DROP POLICY IF EXISTS "Allow all operations for anon users" ON client_accounts;
    `)
    
    await client.query(`
      CREATE POLICY "Allow all operations for anon users" 
      ON client_accounts 
      FOR ALL 
      TO anon 
      USING (true) 
      WITH CHECK (true);
    `)
    console.log('✅ Created policy for anonymous users')
    
    // Grant necessary permissions
    await client.query(`
      GRANT ALL ON client_accounts TO authenticated;
      GRANT ALL ON client_accounts TO anon;
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
    `)
    console.log('✅ Granted permissions')
    
    console.log('\n🎉 Client accounts table permissions fixed!')
    console.log('You should now be able to create new accounts.')
    
  } catch (error) {
    console.error('❌ Error fixing permissions:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

fixPermissions()