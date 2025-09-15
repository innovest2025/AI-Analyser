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
    const { action, userId, unitId, type, title, message, severity, metadata } = await req.json();

    switch (action) {
      case 'create':
        return await createNotification({ userId, unitId, type, title, message, severity, metadata });
      
      case 'mark_read':
        return await markNotificationRead(await req.json());
      
      case 'get_unread':
        return await getUnreadNotifications(userId);
      
      case 'send_risk_alerts':
        return await sendRiskAlerts();
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function createNotification({ userId, unitId, type, title, message, severity, metadata = {} }) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      unit_id: unitId,
      type,
      title,
      message,
      severity,
      metadata
    })
    .select()
    .single();

  if (error) throw error;

  // Check if user wants email notifications
  const { data: profile } = await supabase
    .from('profiles')
    .select('email_notifications, display_name')
    .eq('id', userId)
    .single();

  if (profile?.email_notifications && severity === 'HIGH') {
    // Send email notification
    await sendEmailNotification(userId, title, message);
  }

  return new Response(
    JSON.stringify({ success: true, notification: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function markNotificationRead({ notificationId, userId }) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getUnreadNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      units(name, urn, district)
    `)
    .eq('user_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;

  return new Response(
    JSON.stringify({ notifications: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendRiskAlerts() {
  console.log('Checking for high-risk units to send alerts...');

  // Get all RED tier units
  const { data: redUnits, error: unitsError } = await supabase
    .from('units')
    .select('*')
    .eq('tier', 'RED')
    .gte('risk_score', 80);

  if (unitsError) throw unitsError;

  // Get all users who should receive alerts
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, display_name, email_notifications, district_access')
    .eq('email_notifications', true);

  if (usersError) throw usersError;

  let alertsSent = 0;

  for (const unit of redUnits || []) {
    // Find users who have access to this district or are admins
    const relevantUsers = users?.filter(user => 
      user.district_access.length === 0 || // Admin/global access
      user.district_access.includes(unit.district)
    ) || [];

    for (const user of relevantUsers) {
      // Check if we already sent an alert for this unit today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingAlert } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('unit_id', unit.id)
        .eq('type', 'risk_alert')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .maybeSingle();

      if (!existingAlert) {
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            unit_id: unit.id,
            type: 'risk_alert',
            title: `Critical Risk Alert: ${unit.name}`,
            message: `Unit ${unit.name} (${unit.urn}) in ${unit.district} has a risk score of ${unit.risk_score}. Immediate attention required.`,
            severity: 'HIGH',
            metadata: {
              risk_score: unit.risk_score,
              district: unit.district,
              arrears: unit.arrears
            }
          });

        alertsSent++;
      }
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      alerts_sent: alertsSent,
      units_checked: redUnits?.length || 0 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendEmailNotification(userId: string, title: string, message: string) {
  // This would integrate with an email service like SendGrid, Resend, etc.
  // For now, we'll just log it
  console.log(`Email notification would be sent to user ${userId}: ${title} - ${message}`);
  
  // In a real implementation, you would:
  // 1. Get user's email from auth.users
  // 2. Send email via your preferred service
  // 3. Update notification record with sent_email = true
}