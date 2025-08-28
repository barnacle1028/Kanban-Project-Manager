const { Pool } = require('pg')

const pool = new Pool({
  host: '3.17.236.162',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SehomeGraduation2026!',
  ssl: { rejectUnauthorized: false }
})

async function addAccountFields() {
  const client = await pool.connect()
  
  try {
    console.log('Adding new fields to client_accounts table...\n')
    
    // Add all the new columns
    await client.query(`
      ALTER TABLE client_accounts 
      ADD COLUMN IF NOT EXISTS account_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS address_street VARCHAR(255),
      ADD COLUMN IF NOT EXISTS address_city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS address_state VARCHAR(50),
      ADD COLUMN IF NOT EXISTS address_zip VARCHAR(20),
      ADD COLUMN IF NOT EXISTS primary_contact_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS primary_contact_title VARCHAR(100),
      ADD COLUMN IF NOT EXISTS primary_contact_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS account_note TEXT,
      ADD COLUMN IF NOT EXISTS industry VARCHAR(100)
    `)
    
    console.log('✅ Added all new columns to client_accounts table')
    
    // Check the updated table structure
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'client_accounts' 
      ORDER BY ordinal_position
    `)
    
    console.log('\n📋 Updated Table Structure:')
    structure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
    })
    
    console.log('\n🎉 Client accounts table updated successfully!')
    
  } catch (error) {
    console.error('❌ Error adding fields:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

addAccountFields()