import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, unitId, activityAction, description, metadata = {}, ipAddress, userAgent } = await req.json();

    switch (action) {
      case 'log':
        return await logActivity({ userId, unitId, activityAction, description, metadata, ipAddress, userAgent });
      
      case 'get_activities':
        return await getUserActivities(userId);
      
      case 'get_unit_activities':
        return await getUnitActivities(unitId);
      
      case 'get_audit_trail':
        return await getAuditTrail(await req.json());
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in user-activities function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function logActivity({ userId, unitId, activityAction, description, metadata, ipAddress, userAgent }) {
  const { data, error } = await supabase
    .from('user_activities')
    .insert({
      user_id: userId,
      unit_id: unitId,
      action: activityAction,
      description,
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, activity: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getUserActivities(userId: string) {
  const { data, error } = await supabase
    .from('user_activities')
    .select(`
      *,
      units(name, urn, district)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  return new Response(
    JSON.stringify({ activities: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getUnitActivities(unitId: string) {
  const { data, error } = await supabase
    .from('user_activities')
    .select(`
      *,
      profiles(display_name, role)
    `)
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  return new Response(
    JSON.stringify({ activities: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getAuditTrail({ startDate, endDate, userId, unitId, actionFilter }) {
  let query = supabase
    .from('user_activities')
    .select(`
      *,
      profiles(display_name, role, department),
      units(name, urn, district)
    `)
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  
  if (endDate) {
    query = query.lte('created_at', endDate);
  }
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  if (unitId) {
    query = query.eq('unit_id', unitId);
  }
  
  if (actionFilter) {
    query = query.ilike('action', `%${actionFilter}%`);
  }

  const { data, error } = await query.limit(100);

  if (error) throw error;

  return new Response(
    JSON.stringify({ audit_trail: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}