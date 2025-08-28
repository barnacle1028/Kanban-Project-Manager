const { Pool } = require('pg')

const pool = new Pool({
  host: '3.17.236.162',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SehomeGraduation2026!',
  ssl: { rejectUnauthorized: false }
})

async function createClientAccountsTable() {
  const client = await pool.connect()
  
  try {
    console.log('Creating client_accounts table...')
    
    // Create the client accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_accounts (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        segment VARCHAR(100),
        region VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    
    console.log('✅ Client accounts table created successfully')
    
    // Check if it's empty and populate with sample data
    const count = await client.query('SELECT COUNT(*) FROM client_accounts')
    console.log(`Current records in client_accounts: ${count.rows[0].count}`)
    
    if (parseInt(count.rows[0].count) === 0) {
      console.log('Table is empty, inserting sample data...')
      
      // Sample account data
      const accountData = [
        { id: 'acc-001', name: 'TechCorp Industries', segment: 'Enterprise', region: 'North America' },
        { id: 'acc-002', name: 'Global Manufacturing Ltd', segment: 'Enterprise', region: 'Europe' },
        { id: 'acc-003', name: 'HealthSystem Partners', segment: 'Mid-Market', region: 'North America' },
        { id: 'acc-004', name: 'EduTech Solutions', segment: 'SMB', region: 'North America' },
        { id: 'acc-005', name: 'RetailChain Co', segment: 'Enterprise', region: 'North America' }
      ]
      
      for (const account of accountData) {
        await client.query(`
          INSERT INTO client_accounts (id, name, segment, region)
          VALUES ($1, $2, $3, $4)
        `, [account.id, account.name, account.segment, account.region])
        
        console.log(`✓ Inserted: ${account.name}`)
      }
      
      const finalCount = await client.query('SELECT COUNT(*) FROM client_accounts')
      console.log(`✅ Population complete! Total client accounts: ${finalCount.rows[0].count}`)
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

createClientAccountsTable()