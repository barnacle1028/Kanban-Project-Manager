const { Pool } = require('pg')

const pool = new Pool({
  host: '3.17.236.162',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SehomeGraduation2026!',
  ssl: { rejectUnauthorized: false }
})

async function debugTable() {
  const client = await pool.connect()
  
  try {
    console.log('Debugging client_accounts table...\n')
    
    // 1. Check table structure
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'client_accounts' 
      ORDER BY ordinal_position
    `)
    
    console.log('📋 Table Structure:')
    structure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'}) ${row.column_default ? `[default: ${row.column_default}]` : ''}`)
    })
    
    // 2. Check RLS policies
    const policies = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies 
      WHERE tablename = 'client_accounts'
    `)
    
    console.log('\n🔒 RLS Policies:')
    if (policies.rows.length === 0) {
      console.log('  - No policies found')
    } else {
      policies.rows.forEach(row => {
        console.log(`  - ${row.policyname}: ${row.cmd} for ${row.roles}`)
      })
    }
    
    // 3. Test a simple insert
    console.log('\n🧪 Testing insert...')
    try {
      const testResult = await client.query(`
        INSERT INTO client_accounts (name, segment, region)
        VALUES ('Test Account', 'Enterprise', 'North America')
        RETURNING id, name
      `)
      console.log(`✅ Insert successful: ${testResult.rows[0].name} (${testResult.rows[0].id})`)
      
      // Clean up test record
      await client.query('DELETE FROM client_accounts WHERE name = $1', ['Test Account'])
      console.log('🧹 Test record cleaned up')
      
    } catch (insertError) {
      console.log(`❌ Insert failed: ${insertError.message}`)
    }
    
    // 4. Check existing records
    const records = await client.query('SELECT COUNT(*) as count FROM client_accounts')
    console.log(`\n📊 Current records: ${records.rows[0].count}`)
    
  } catch (error) {
    console.error('❌ Debug error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

debugTable()