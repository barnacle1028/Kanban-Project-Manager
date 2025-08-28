const { Pool } = require('pg')
const dns = require('dns')
require('dotenv').config()

// Configure DNS to use public DNS servers for better resolution
dns.setServers(['1.1.1.1', '8.8.8.8'])

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false
  }
})

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount })
    }
    return res
  } catch (error) {
    const duration = Date.now() - start
    console.error('Query error', { text, duration, error: error.message })
    throw error
  }
}

const getClient = async () => {
  return await pool.connect()
}

module.exports = {
  query,
  getClient,
  pool
}