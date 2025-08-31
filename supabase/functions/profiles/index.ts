import { createClient } from 'npm:@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface ProfileData {
  name: string;
  phone: string;
  role: string;
  service_name?: string;
  bio?: string;
  location?: string;
  price?: string;
  profile_image?: string;
  banner_image?: string;
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const profileId = pathSegments[pathSegments.length - 1];

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (req.method) {
      case 'GET':
        return await handleGetProfile(supabaseClient, profileId, user.id);
      
      case 'POST':
        return await handleCreateProfile(supabaseClient, req, user.id);
      
      case 'PUT':
        return await handleUpdateProfile(supabaseClient, req, user.id);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Profile function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleGetProfile(supabaseClient: any, profileId: string, userId: string) {
  try {
    const targetId = profileId === 'me' ? userId : profileId;
    
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    return new Response(
      JSON.stringify({ profile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch profile' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCreateProfile(supabaseClient: any, req: Request, userId: string) {
  try {
    const profileData: ProfileData = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'role'];
    const missingFields = requiredFields.filter(field => !profileData[field as keyof ProfileData]);
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          missing: missingFields 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number (Indian mobile number format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(profileData.phone)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate role
    const validRoles = ['Property 360', 'Builder', 'Advocate', 'Landowner', 'Society', 'Interior', 'Consulting'];
    if (!validRoles.includes(profileData.role)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid role. Please select a valid service category.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'Profile already exists for this user' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new profile
    const { data: newProfile, error } = await supabaseClient
      .from('profiles')
      .insert({
        id: userId,
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
        role: profileData.role,
        service_name: profileData.service_name?.trim() || null,
        bio: profileData.bio?.trim() || null,
        location: profileData.location?.trim() || null,
        price: profileData.price?.trim() || null,
        profile_image: profileData.profile_image || null,
        banner_image: profileData.banner_image || null
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'Profile created successfully', 
        profile: newProfile 
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Create profile error:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request data' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleUpdateProfile(supabaseClient: any, req: Request, userId: string) {
  try {
    const profileData: Partial<ProfileData> = await req.json();
    
    // Validate phone number if provided
    if (profileData.phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(profileData.phone)) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate role if provided
    if (profileData.role) {
      const validRoles = ['Property 360', 'Builder', 'Advocate', 'Landowner', 'Society', 'Interior', 'Consulting'];
      if (!validRoles.includes(profileData.role)) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid role. Please select a valid service category.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Prepare update data (only include fields that are provided)
    const updateData: any = {};
    if (profileData.name !== undefined) updateData.name = profileData.name.trim();
    if (profileData.phone !== undefined) updateData.phone = profileData.phone.trim();
    if (profileData.role !== undefined) updateData.role = profileData.role;
    if (profileData.service_name !== undefined) updateData.service_name = profileData.service_name?.trim() || null;
    if (profileData.bio !== undefined) updateData.bio = profileData.bio?.trim() || null;
    if (profileData.location !== undefined) updateData.location = profileData.location?.trim() || null;
    if (profileData.price !== undefined) updateData.price = profileData.price?.trim() || null;
    if (profileData.profile_image !== undefined) updateData.profile_image = profileData.profile_image || null;
    if (profileData.banner_image !== undefined) updateData.banner_image = profileData.banner_image || null;

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid fields provided for update' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update profile
    const { data: updatedProfile, error } = await supabaseClient
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'Profile updated successfully', 
        profile: updatedProfile 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request data' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}