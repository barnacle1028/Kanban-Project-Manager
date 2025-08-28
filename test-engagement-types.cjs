// Quick test to check engagement_types table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testEngagementTypesTable() {
  console.log('🔍 Testing engagement_types table access...\n');
  
  // Read environment variables
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Config:');
  console.log('- URL:', url ? 'Set' : 'Missing');
  console.log('- Key:', key ? (key.length > 50 ? 'Set (length: ' + key.length + ')' : 'Set but looks incomplete') : 'Missing');
  console.log();
  
  if (!url || !key) {
    console.log('❌ Missing Supabase configuration');
    return;
  }
  
  const supabase = createClient(url, key);
  
  try {
    console.log('📊 Testing table access...');
    
    // Test 1: Check if we can access the table at all
    const { data: countData, error: countError } = await supabase
      .from('engagement_types')
      .select('count', { count: 'exact', head: true });
      
    if (countError) {
      console.log('❌ Table access failed:', countError.message);
      console.log('   Code:', countError.code);
      console.log('   This could mean:');
      console.log('   - Table doesn\'t exist');
      console.log('   - No permission to access table');
      console.log('   - RLS policy blocking access');
      return;
    }
    
    console.log('✅ Table accessible! Row count:', countData?.count || 0);
    
    // Test 2: Try to get actual data
    const { data, error } = await supabase
      .from('engagement_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .limit(5);
      
    if (error) {
      console.log('❌ Data query failed:', error.message);
      return;
    }
    
    console.log('✅ Data query successful!');
    console.log('   Found', data?.length || 0, 'active engagement types');
    
    if (data && data.length > 0) {
      console.log('\n📋 Sample data:');
      data.forEach((type, i) => {
        console.log(`   ${i+1}. ${type.name} (${type.default_duration_hours || 'N/A'}h)`);
      });
    } else {
      console.log('\n⚠️  Table exists but has no active records');
      
      // Check if there are any records at all (including inactive)
      const { data: allData } = await supabase
        .from('engagement_types')
        .select('*')
        .limit(5);
        
      console.log('   Total records (including inactive):', allData?.length || 0);
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

testEngagementTypesTable();