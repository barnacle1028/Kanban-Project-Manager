const { Pool } = require('pg')

const pool = new Pool({
  host: '3.17.236.162',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SehomeGraduation2026!',
  ssl: { rejectUnauthorized: false }
})

async function findAccountTables() {
  const client = await pool.connect()
  
  try {
    // Find all tables with 'account' in the name
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name ILIKE '%account%'
      ORDER BY table_name
    `)
    
    console.log('Tables with "account" in name:')
    for (const row of result.rows) {
      console.log(`\n📋 Table: ${row.table_name}`)
      
      // Get structure of each table
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [row.table_name])
      
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

findAccountTables()