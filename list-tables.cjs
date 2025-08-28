const { Pool } = require('pg')

const pool = new Pool({
  host: '3.17.236.162',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SehomeGraduation2026!',
  ssl: { rejectUnauthorized: false }
})

async function listTables() {
  const client = await pool.connect()
  
  try {
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('All available tables in the database:')
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`)
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

listTables()