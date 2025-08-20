const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function setupDatabase() {
  console.log('🚀 Setting up Kanban database with authentication...')
  
  // Extract password from user input
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  const password = await new Promise((resolve) => {
    readline.question('Enter your Supabase database password: ', (answer) => {
      readline.close()
      resolve(answer)
    })
  })
  
  // Create connection with actual password
  const connectionString = process.env.DATABASE_URL.replace('[YOUR-PASSWORD]', password)
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase
    }
  })

  try {
    // Test connection
    console.log('📡 Testing database connection...')
    const client = await pool.connect()
    console.log('✅ Database connection successful!')
    
    // Read and execute schema
    console.log('📋 Creating database schema...')
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
    await client.query(schemaSQL)
    console.log('✅ Base schema created!')
    
    // Read and execute authentication migration
    console.log('🔐 Adding authentication system...')
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'migrations', '001_add_authentication.sql'), 'utf8')
    await client.query(migrationSQL)
    console.log('✅ Authentication system added!')
    
    // Create seed data
    console.log('🌱 Adding seed data...')
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8')
    await client.query(seedSQL)
    console.log('✅ Seed data added!')
    
    // Update .env with the actual password (optional)
    console.log('📝 Updating .env file...')
    const envContent = fs.readFileSync('.env', 'utf8')
    const updatedEnv = envContent.replace('[YOUR-PASSWORD]', password)
    fs.writeFileSync('.env', updatedEnv)
    console.log('✅ Environment file updated!')
    
    client.release()
    
    console.log('\n🎉 Database setup complete!')
    console.log('\nDefault admin credentials:')
    console.log('📧 Email: admin@kanban-app.com')
    console.log('🔑 Password: admin123!')
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!')
    
    console.log('\nNext steps:')
    console.log('1. Start the backend server: npm run server:dev')
    console.log('2. Frontend is already running on http://localhost:5173')
    console.log('3. Login with the admin credentials above')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.error('🔑 Please check your database password')
    } else if (error.message.includes('does not exist')) {
      console.error('📋 Database schema issue - this might be normal for first setup')
    } else {
      console.error('🔍 Full error:', error)
    }
  } finally {
    await pool.end()
  }
}

// Handle graceful exit
process.on('SIGINT', async () => {
  console.log('\n👋 Setup cancelled by user')
  process.exit(0)
})

setupDatabase().catch(console.error)