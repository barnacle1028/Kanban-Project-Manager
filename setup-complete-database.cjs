#!/usr/bin/env node

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function setupCompleteDatabase() {
  console.log('🚀 Setting up complete Kanban database schema...')
  
  // Database connection
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.gmqdmwligbsjybjdqzhf:SehomeGraduation2026%21@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
  })
  
  try {
    console.log('📡 Connecting to database...')
    await client.connect()
    
    console.log('🗄️ Reading database schema file...')
    const schemaPath = path.join(__dirname, 'database-schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('⚡ Creating complete database schema...')
    await client.query(schemaSQL)
    
    console.log('✅ Database schema created successfully!')
    
    // Test the new structure
    console.log('🔍 Verifying tables were created...')
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    
    console.log('📋 Created tables:')
    tableResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`)
    })
    
    // Verify account table structure specifically
    console.log('🧪 Checking account table structure...')
    const accountColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'account' 
      ORDER BY ordinal_position
    `)
    
    console.log('📊 Account table columns:')
    accountColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    })
    
    // Check if default roles were created
    console.log('👥 Checking default roles...')
    const rolesResult = await client.query('SELECT name, role_type FROM user_roles ORDER BY name')
    console.log('🎯 Available roles:')
    rolesResult.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.role_type})`)
    })
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    if (error.detail) {
      console.error('   Detail:', error.detail)
    }
    if (error.hint) {
      console.error('   Hint:', error.hint)
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

setupCompleteDatabase().then(() => {
  console.log('🎉 Complete database setup finished!')
  console.log('✨ Your application should now work with all required tables.')
  process.exit(0)
}).catch(console.error)