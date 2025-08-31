import { createClient } from 'npm:@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface SearchFilters {
  search?: string;
  location?: string;
  role?: string;
  limit?: number;
  offset?: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);

    switch (req.method) {
      case 'GET':
        return await handleSearchProfiles(supabaseClient, url);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Marketplace function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleSearchProfiles(supabaseClient: any, url: URL) {
  try {
    const searchParams = url.searchParams;
    const filters: SearchFilters = {
      search: searchParams.get('search') || undefined,
      location: searchParams.get('location') || undefined,
      role: searchParams.get('role') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // Build query
    let query = supabaseClient
      .from('profiles')
      .select(`
        id,
        name,
        role,
        service_name,
        bio,
        location,
        price,
        profile_image,
        banner_image,
        created_at
      `);

    // Apply filters
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,service_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`
      );
    }

    if (filters.location && filters.location !== 'All Locations') {
      query = query.eq('location', filters.location);
    }

    if (filters.role && filters.role !== 'All Roles') {
      query = query.eq('role', filters.role);
    }

    // Apply pagination
    query = query
      .range(filters.offset!, filters.offset! + filters.limit! - 1)
      .order('created_at', { ascending: false });

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error('Search profiles error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to search profiles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({ 
        profiles: profiles || [],
        pagination: {
          total: totalCount || 0,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: (filters.offset! + filters.limit!) < (totalCount || 0)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Search profiles error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search profiles' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}