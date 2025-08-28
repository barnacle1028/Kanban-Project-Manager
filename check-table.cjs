const { Pool } = require('pg')

const pool = new Pool({
  host: '3.17.236.162',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SehomeGraduation2026!',
  ssl: { rejectUnauthorized: false }
})

async function checkTable() {
  const client = await pool.connect()
  
  try {
    // Check if table exists and get its structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'account' 
      ORDER BY ordinal_position
    `)
    
    if (result.rows.length === 0) {
      console.log('❌ Account table does not exist')
    } else {
      console.log('✅ Account table structure:')
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
    }
    
  } catch (error) {
    console.error('Error checking table:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

checkTable()