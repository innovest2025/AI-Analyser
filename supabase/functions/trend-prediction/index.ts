import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scope = 'district', district, timeframe = '3_months' } = await req.json();

    let query = supabase.from('units').select(`
      id,
      urn,
      district,
      risk_score,
      tier,
      kwh_consumption,
      arrears,
      last_updated,
      alert_history(date, severity)
    `);

    if (scope === 'district' && district) {
      query = query.eq('district', district);
    }

    const { data: units, error: unitsError } = await query.limit(100);

    if (unitsError) {
      throw new Error(`Database error: ${unitsError.message}`);
    }

    if (!units || units.length === 0) {
      throw new Error('No units found for analysis');
    }

    // Aggregate data for trend analysis
    const trendData = {
      totalUnits: units.length,
      riskDistribution: {
        RED: units.filter(u => u.tier === 'RED').length,
        AMBER: units.filter(u => u.tier === 'AMBER').length,
        GREEN: units.filter(u => u.tier === 'GREEN').length
      },
      avgRiskScore: units.reduce((sum, u) => sum + (u.risk_score || 0), 0) / units.length,
      totalArrears: units.reduce((sum, u) => sum + (u.arrears || 0), 0),
      consumptionTrends: units.map(u => ({
        district: u.district,
        consumption: u.kwh_consumption?.slice(-6) || [],
        riskScore: u.risk_score
      })),
      recentAlerts: units.flatMap(u => 
        (u.alert_history || []).map(alert => ({
          district: u.district,
          date: alert.date,
          severity: alert.severity
        }))
      ).slice(-20)
    };

    // Create AI prompt for trend prediction
    const prompt = `Analyze electricity consumer risk trends and provide predictions:

CURRENT STATE ANALYSIS:
- Total Units: ${trendData.totalUnits}
- Risk Distribution: ${trendData.riskDistribution.RED} RED, ${trendData.riskDistribution.AMBER} AMBER, ${trendData.riskDistribution.GREEN} GREEN
- Average Risk Score: ${trendData.avgRiskScore.toFixed(2)}/100
- Total Outstanding Arrears: ₹${trendData.totalArrears.toLocaleString()}
- Analysis Scope: ${scope === 'district' ? `District: ${district}` : 'State-wide'}
- Timeframe: ${timeframe}

RECENT ALERT PATTERNS:
${trendData.recentAlerts.map(a => `${a.date}: ${a.severity} alert in ${a.district}`).join('\n')}

CONSUMPTION PATTERNS:
${trendData.consumptionTrends.slice(0, 10).map(t => 
  `${t.district}: Recent consumption [${t.consumption.join(', ')}] kWh, Risk: ${t.riskScore}`
).join('\n')}

Please provide:

1. TREND ANALYSIS:
   - Current risk trajectory
   - Consumption pattern insights
   - District-level variations

2. PREDICTIONS (${timeframe}):
   - Expected risk distribution changes
   - Potential high-risk areas
   - Revenue impact projections

3. EARLY WARNING INDICATORS:
   - Key metrics to monitor
   - Threshold values for alerts
   - Seasonal factors to consider

4. STRATEGIC RECOMMENDATIONS:
   - Priority intervention areas
   - Resource allocation suggestions
   - Preventive measures

5. OPERATIONAL INSIGHTS:
   - Field team deployment priorities
   - Collection strategy focus areas
   - Infrastructure investment needs

Format your response with clear sections and actionable insights.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI expert in electricity distribution analytics and risk management for TANGEDCO. Provide data-driven insights and actionable recommendations.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const prediction = data.choices[0].message.content;

    // Calculate confidence based on data quality
    const confidenceFactors = {
      sampleSize: Math.min(trendData.totalUnits / 50, 1),
      dataRecency: 0.8, // Assume recent data
      alertCoverage: Math.min(trendData.recentAlerts.length / 10, 1),
      consumptionData: trendData.consumptionTrends.filter(t => t.consumption.length > 3).length / trendData.totalUnits
    };

    const confidenceScore = Object.values(confidenceFactors).reduce((sum, factor) => sum + factor, 0) / 4;

    return new Response(
      JSON.stringify({
        prediction,
        confidence_score: Math.min(confidenceScore, 0.95),
        analysis_metadata: {
          scope,
          district,
          timeframe,
          units_analyzed: trendData.totalUnits,
          data_quality: confidenceFactors
        },
        trend_summary: trendData,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in trend-prediction function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});