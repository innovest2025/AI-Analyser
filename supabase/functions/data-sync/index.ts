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

// Mock data for initial seeding
const mockUnits = [
  {
    urn: "TN001234567",
    name: "Chennai Commercial Complex",
    district: "Chennai",
    service_no: "CC001234567",
    risk_score: 85.5,
    tier: "RED",
    kwh_consumption: [1250, 1380, 1420, 1500, 1650, 1750],
    arrears: 45000,
    disconnect_flag: false,
    peer_percentile: 15
  },
  {
    urn: "TN002345678",
    name: "Coimbatore Textile Mill",
    district: "Coimbatore",
    service_no: "CB002345678",
    risk_score: 72.3,
    tier: "AMBER",
    kwh_consumption: [2800, 2900, 2750, 2850, 2950, 3100],
    arrears: 28000,
    disconnect_flag: false,
    peer_percentile: 35
  },
  {
    urn: "TN003456789",
    name: "Madurai Residential Society",
    district: "Madurai",
    service_no: "MD003456789",
    risk_score: 25.8,
    tier: "GREEN",
    kwh_consumption: [450, 480, 420, 510, 490, 520],
    arrears: 2500,
    disconnect_flag: false,
    peer_percentile: 78
  },
  {
    urn: "TN004567890",
    name: "Salem Manufacturing Unit",
    district: "Salem",
    service_no: "SL004567890",
    risk_score: 91.2,
    tier: "RED",
    kwh_consumption: [3200, 3400, 3600, 3800, 4000, 4200],
    arrears: 125000,
    disconnect_flag: true,
    peer_percentile: 8
  },
  {
    urn: "TN005678901",
    name: "Trichy IT Campus",
    district: "Trichy",
    service_no: "TR005678901",
    risk_score: 45.6,
    tier: "AMBER",
    kwh_consumption: [1800, 1750, 1900, 1850, 1950, 2000],
    arrears: 12000,
    disconnect_flag: false,
    peer_percentile: 55
  }
];

const mockShapDrivers = [
  { feature: "Payment History", impact: 0.35, value: "3 months overdue" },
  { feature: "Consumption Pattern", impact: 0.28, value: "Irregular usage" },
  { feature: "Arrears Amount", impact: 0.25, value: "₹45,000" },
  { feature: "Peer Comparison", impact: 0.12, value: "Bottom 15%" }
];

const mockAlertHistory = [
  { date: "2024-01-15", type: "Payment Overdue", severity: "RED" },
  { date: "2024-01-08", type: "High Consumption", severity: "AMBER" },
  { date: "2023-12-22", type: "Irregular Pattern", severity: "AMBER" },
  { date: "2023-12-15", type: "Arrears Alert", severity: "RED" }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'sync_all' } = await req.json();

    let result = {};

    switch (action) {
      case 'sync_units':
        // Insert/update units
        for (const unit of mockUnits) {
          const { data: existingUnit } = await supabase
            .from('units')
            .select('id')
            .eq('urn', unit.urn)
            .maybeSingle();

          if (existingUnit) {
            // Update existing unit
            const { error } = await supabase
              .from('units')
              .update({
                risk_score: unit.risk_score,
                tier: unit.tier,
                kwh_consumption: unit.kwh_consumption,
                arrears: unit.arrears,
                disconnect_flag: unit.disconnect_flag,
                peer_percentile: unit.peer_percentile,
                last_updated: new Date().toISOString()
              })
              .eq('id', existingUnit.id);

            if (error) {
              console.error('Error updating unit:', error);
            }
          } else {
            // Insert new unit
            const { error } = await supabase
              .from('units')
              .insert(unit);

            if (error) {
              console.error('Error inserting unit:', error);
            }
          }
        }
        result.units_synced = mockUnits.length;
        break;

      case 'sync_shap_drivers':
        // Get unit IDs for SHAP drivers
        const { data: units } = await supabase
          .from('units')
          .select('id, urn');

        if (units) {
          for (const unit of units.slice(0, 2)) { // Just add for first 2 units
            // Clear existing SHAP drivers
            await supabase
              .from('shap_drivers')
              .delete()
              .eq('unit_id', unit.id);

            // Insert new SHAP drivers
            const shapData = mockShapDrivers.map(driver => ({
              unit_id: unit.id,
              feature: driver.feature,
              impact: driver.impact,
              value: driver.value
            }));

            const { error } = await supabase
              .from('shap_drivers')
              .insert(shapData);

            if (error) {
              console.error('Error inserting SHAP drivers:', error);
            }
          }
        }
        result.shap_drivers_synced = true;
        break;

      case 'sync_alerts':
        // Get unit IDs for alert history
        const { data: alertUnits } = await supabase
          .from('units')
          .select('id, urn');

        if (alertUnits) {
          for (const unit of alertUnits.slice(0, 3)) { // Add alerts for first 3 units
            // Clear existing alerts
            await supabase
              .from('alert_history')
              .delete()
              .eq('unit_id', unit.id);

            // Insert new alert history
            const alertData = mockAlertHistory.map(alert => ({
              unit_id: unit.id,
              date: alert.date,
              type: alert.type,
              severity: alert.severity,
              message: `${alert.type} alert for unit ${unit.urn}`
            }));

            const { error } = await supabase
              .from('alert_history')
              .insert(alertData);

            if (error) {
              console.error('Error inserting alert history:', error);
            }
          }
        }
        result.alerts_synced = true;
        break;

      case 'sync_district_stats':
        // Calculate and update district stats
        const { data: allUnits } = await supabase
          .from('units')
          .select('district, tier, risk_score');

        if (allUnits) {
          const districtStats = allUnits.reduce((acc, unit) => {
            const district = unit.district;
            if (!acc[district]) {
              acc[district] = {
                name: district,
                red_count: 0,
                amber_count: 0,
                green_count: 0,
                total_units: 0,
                total_risk_score: 0,
                sla_compliance: 95.5 // Mock SLA compliance
              };
            }

            acc[district].total_units++;
            acc[district].total_risk_score += unit.risk_score || 0;
            
            switch (unit.tier) {
              case 'RED':
                acc[district].red_count++;
                break;
              case 'AMBER':
                acc[district].amber_count++;
                break;
              case 'GREEN':
                acc[district].green_count++;
                break;
            }

            return acc;
          }, {} as any);

          // Clear existing district stats
          await supabase.from('district_stats').delete().neq('id', '00000000-0000-0000-0000-000000000000');

          // Insert updated district stats
          const districtStatsArray = Object.values(districtStats).map((stats: any) => ({
            ...stats,
            avg_risk_score: stats.total_risk_score / stats.total_units
          }));

          const { error } = await supabase
            .from('district_stats')
            .insert(districtStatsArray);

          if (error) {
            console.error('Error inserting district stats:', error);
          }

          result.district_stats_synced = districtStatsArray.length;
        }
        break;

      case 'sync_all':
      default:
        // Perform all sync operations
        const syncResponse = await Promise.all([
          fetch(`${supabaseUrl}/functions/v1/data-sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'sync_units' })
          }),
          fetch(`${supabaseUrl}/functions/v1/data-sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'sync_shap_drivers' })
          }),
          fetch(`${supabaseUrl}/functions/v1/data-sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'sync_alerts' })
          }),
          fetch(`${supabaseUrl}/functions/v1/data-sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'sync_district_stats' })
          })
        ]);

        result.all_synced = true;
        break;
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in data-sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});