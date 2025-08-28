const { Pool } = require('pg')

// Direct IP connection to bypass DNS issues
const pool = new Pool({
  host: '3.17.236.162',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SehomeGraduation2026!',
  ssl: { rejectUnauthorized: false },
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// Sample account data from the mock data
const accountData = [
  { id: 'acc-001', name: 'TechCorp Industries', segment: 'Enterprise', region: 'North America' },
  { id: 'acc-002', name: 'Global Manufacturing Ltd', segment: 'Enterprise', region: 'Europe' },
  { id: 'acc-003', name: 'HealthSystem Partners', segment: 'Mid-Market', region: 'North America' },
  { id: 'acc-004', name: 'EduTech Solutions', segment: 'SMB', region: 'North America' },
  { id: 'acc-005', name: 'RetailChain Co', segment: 'Enterprise', region: 'North America' },
  { id: 'acc-006', name: 'FinanceFirst Bank', segment: 'Enterprise', region: 'North America' },
  { id: 'acc-007', name: 'StartupInnovate Inc', segment: 'SMB', region: 'North America' },
  { id: 'acc-008', name: 'MedDevice Systems', segment: 'Mid-Market', region: 'Europe' },
  { id: 'acc-009', name: 'LogisticsPro LLC', segment: 'Mid-Market', region: 'North America' },
  { id: 'acc-010', name: 'CloudServices Network', segment: 'Enterprise', region: 'Asia Pacific' },
  { id: 'acc-011', name: 'SportsTech Company', segment: 'SMB', region: 'North America' },
  { id: 'acc-012', name: 'DataAnalytics Pro', segment: 'Mid-Market', region: 'Europe' },
  { id: 'acc-013', name: 'GreenEnergy Solutions', segment: 'Enterprise', region: 'North America' },
  { id: 'acc-014', name: 'FoodService Partners', segment: 'Mid-Market', region: 'North America' },
  { id: 'acc-015', name: 'AutoParts Direct', segment: 'SMB', region: 'North America' },
  { id: 'acc-016', name: 'ConsultingPlus Group', segment: 'Mid-Market', region: 'Europe' },
  { id: 'acc-017', name: 'TravelTech Solutions', segment: 'SMB', region: 'North America' },
  { id: 'acc-018', name: 'InsurancePro Corp', segment: 'Enterprise', region: 'North America' },
  { id: 'acc-019', name: 'RealEstate Analytics', segment: 'Mid-Market', region: 'North America' },
  { id: 'acc-020', name: 'SecurityFirst Systems', segment: 'Enterprise', region: 'North America' },
  { id: 'acc-021', name: 'PharmaTech Labs', segment: 'Enterprise', region: 'Europe' },
  { id: 'acc-022', name: 'AgriTech Innovations', segment: 'Mid-Market', region: 'North America' },
  { id: 'acc-023', name: 'MarketingPro Agency', segment: 'SMB', region: 'North America' },
  { id: 'acc-024', name: 'EventPlanning Plus', segment: 'SMB', region: 'North America' },
  { id: 'acc-025', name: 'BioTech Research Co', segment: 'Enterprise', region: 'North America' }
]

async function populateAccounts() {
  const client = await pool.connect()
  
  try {
    console.log('Starting account population using direct IP connection...')
    
    // Check if accounts already exist
    const existingCount = await client.query('SELECT COUNT(*) FROM account')
    console.log(`Existing accounts: ${existingCount.rows[0].count}`)
    
    if (parseInt(existingCount.rows[0].count) > 0) {
      console.log('Accounts table already has data. Skipping population.')
      return
    }
    
    // Insert each account
    for (const account of accountData) {
      try {
        await client.query(`
          INSERT INTO account (id, name, segment, region, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [account.id, account.name, account.segment, account.region])
        
        console.log(`✓ Inserted: ${account.name}`)
      } catch (error) {
        console.error(`✗ Failed to insert ${account.name}:`, error.message)
      }
    }
    
    // Verify insertion
    const finalCount = await client.query('SELECT COUNT(*) FROM account')
    console.log(`\nPopulation complete! Total accounts: ${finalCount.rows[0].count}`)
    
  } catch (error) {
    console.error('Error populating accounts:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

populateAccounts()