const { Pool } = require('pg')

const pool = new Pool({
  host: '3.17.236.162',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SehomeGraduation2026!',
  ssl: { rejectUnauthorized: false }
})

async function fixIdColumn() {
  const client = await pool.connect()
  
  try {
    console.log('Fixing client_accounts ID column...\n')
    
    // Check current ID values
    const currentIds = await client.query('SELECT id FROM client_accounts ORDER BY created_at')
    console.log('📋 Current IDs:', currentIds.rows.map(r => r.id))
    
    // Option 1: Change ID column to UUID with default
    console.log('\n🔧 Adding UUID default to ID column...')
    
    await client.query(`
      ALTER TABLE client_accounts 
      ALTER COLUMN id SET DEFAULT gen_random_uuid()::text
    `)
    
    console.log('✅ Added UUID default to ID column')
    
    // Test insert now
    console.log('\n🧪 Testing insert with UUID default...')
    const testResult = await client.query(`
      INSERT INTO client_accounts (name, segment, region)
      VALUES ('Test Company UUID', 'SMB', 'North America')
      RETURNING id, name
    `)
    
    console.log(`✅ Insert successful with auto-generated ID: ${testResult.rows[0].id}`)
    
    // Clean up test record
    await client.query('DELETE FROM client_accounts WHERE id = $1', [testResult.rows[0].id])
    console.log('🧹 Test record cleaned up')
    
    console.log('\n🎉 Client accounts table is now ready for inserts!')
    
  } catch (error) {
    console.error('❌ Error fixing ID column:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

fixIdColumn()