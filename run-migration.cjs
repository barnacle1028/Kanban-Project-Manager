#!/usr/bin/env node

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  console.log('🚀 Starting database migration...')
  
  // Read the migration file
  const migrationPath = path.join(__dirname, 'migrations', '004_extend_engagement_table.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
  
  // Database connection
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:SehomeGraduation2026!@db.gmqdmwligbsjybjdqzhf.supabase.co:5432/postgres'
  })
  
  try {
    console.log('📡 Connecting to database...')
    await client.connect()
    
    console.log('⚡ Running migration: 004_extend_engagement_table.sql')
    await client.query(migrationSQL)
    
    console.log('✅ Migration completed successfully!')
    
    // Test the new structure
    console.log('🔍 Testing engagement table structure...')
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'engagement' 
      AND column_name IN ('account_name', 'assigned_rep', 'sales_type', 'speed', 'crm')
      ORDER BY column_name
    `)
    
    console.log('📋 New engagement table columns:')
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    })
    
    // Check sample data
    console.log('📊 Checking sample data...')
    const sampleData = await client.query('SELECT COUNT(*) as count FROM engagement')
    console.log(`  Found ${sampleData.rows[0].count} engagement(s) in the database`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    if (error.detail) {
      console.error('   Detail:', error.detail)
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration().then(() => {
  console.log('🎉 Database migration completed!')
  process.exit(0)
}).catch(console.error)