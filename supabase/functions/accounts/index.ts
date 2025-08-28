import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(part => part)
    const method = req.method
    
    // Extract account ID if present in path
    const accountId = pathParts.length > 0 ? pathParts[pathParts.length - 1] : null

    switch (method) {
      case 'GET':
        if (url.searchParams.has('q')) {
          // Search accounts
          const query = url.searchParams.get('q')
          if (!query || query.trim() === '') {
            return new Response(
              JSON.stringify({ error: 'Search query is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          const { data: searchData, error: searchError } = await supabaseClient
            .from('client_accounts')
            .select('id, name, segment, region, created_at')
            .or(`name.ilike.%${query}%,segment.ilike.%${query}%,region.ilike.%${query}%`)
            .order('name', { ascending: true })

          if (searchError) {
            return new Response(
              JSON.stringify({ error: 'Failed to search accounts' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(searchData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        } else if (accountId) {
          // Get account by ID
          const { data, error } = await supabaseClient
            .from('client_accounts')
            .select('id, name, segment, region, created_at')
            .eq('id', accountId)
            .single()

          if (error || !data) {
            return new Response(
              JSON.stringify({ error: 'Account not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        } else {
          // Get all accounts
          const { data, error } = await supabaseClient
            .from('client_accounts')
            .select('id, name, segment, region, created_at')
            .order('name', { ascending: true })

          if (error) {
            return new Response(
              JSON.stringify({ error: 'Failed to fetch accounts' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        // Create new account
        const createData = await req.json()
        const { name, segment, region } = createData

        if (!name || name.trim() === '') {
          return new Response(
            JSON.stringify({ error: 'Account name is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: newAccount, error: createError } = await supabaseClient
          .from('client_accounts')
          .insert([{
            name: name.trim(),
            segment: segment || null,
            region: region || null
          }])
          .select('id, name, segment, region, created_at')
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ 
              error: createError.code === '23505' 
                ? 'An account with this name already exists' 
                : 'Failed to create account' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(newAccount),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'PATCH':
        // Update account
        if (!accountId) {
          return new Response(
            JSON.stringify({ error: 'Account ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData = await req.json()
        const updates: any = {}

        if (updateData.name !== undefined) {
          if (updateData.name.trim() === '') {
            return new Response(
              JSON.stringify({ error: 'Account name cannot be empty' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          updates.name = updateData.name.trim()
        }

        if (updateData.segment !== undefined) {
          updates.segment = updateData.segment || null
        }

        if (updateData.region !== undefined) {
          updates.region = updateData.region || null
        }

        if (Object.keys(updates).length === 0) {
          return new Response(
            JSON.stringify({ error: 'No fields to update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: updatedAccount, error: updateError } = await supabaseClient
          .from('client_accounts')
          .update(updates)
          .eq('id', accountId)
          .select('id, name, segment, region, created_at')
          .single()

        if (updateError || !updatedAccount) {
          return new Response(
            JSON.stringify({ 
              error: updateError?.code === '23505' 
                ? 'An account with this name already exists' 
                : 'Account not found or failed to update' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(updatedAccount),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        // Delete account
        if (!accountId) {
          return new Response(
            JSON.stringify({ error: 'Account ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if account has related engagements
        const { count } = await supabaseClient
          .from('engagement')
          .select('id', { count: 'exact' })
          .eq('account_id', accountId)

        if (count && count > 0) {
          return new Response(
            JSON.stringify({ 
              error: 'Cannot delete account with existing engagements. Please delete or reassign engagements first.' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabaseClient
          .from('client_accounts')
          .delete()
          .eq('id', accountId)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: 'Failed to delete account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(null, { status: 204, headers: corsHeaders })

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})