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
    const { unitId, analysisType = 'risk_assessment' } = await req.json();

    if (!unitId) {
      throw new Error('Unit ID is required');
    }

    // Fetch unit data
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select(`
        *,
        shap_drivers(*),
        alert_history(*)
      `)
      .eq('id', unitId)
      .single();

    if (unitError || !unit) {
      throw new Error('Unit not found');
    }

    // Prepare data for AI analysis
    const unitContext = {
      urn: unit.urn,
      name: unit.name,
      district: unit.district,
      riskScore: unit.risk_score,
      tier: unit.tier,
      kwhConsumption: unit.kwh_consumption,
      arrears: unit.arrears,
      disconnectFlag: unit.disconnect_flag,
      shapDrivers: unit.shap_drivers,
      alertHistory: unit.alert_history.slice(-5) // Last 5 alerts
    };

    // Create AI prompt based on analysis type
    let prompt = '';
    let systemPrompt = 'You are an AI expert in electricity consumer risk analysis for Tamil Nadu Electricity Board (TANGEDCO).';

    switch (analysisType) {
      case 'risk_assessment':
        prompt = `Analyze this electricity consumer's risk profile:
        
Consumer: ${unitContext.name} (${unitContext.urn})
District: ${unitContext.district}
Current Risk Score: ${unitContext.riskScore}/100
Risk Tier: ${unitContext.tier}
Recent Consumption: ${unitContext.kwhConsumption?.slice(-6)?.join(', ')} kWh
Outstanding Arrears: ₹${unitContext.arrears}
Disconnection Flag: ${unitContext.disconnectFlag ? 'Yes' : 'No'}
Recent Alerts: ${unitContext.alertHistory?.map(a => `${a.date}: ${a.type} (${a.severity})`).join(', ')}

Key Risk Factors:
${unitContext.shapDrivers?.map(d => `- ${d.feature}: ${d.value} (Impact: ${d.impact})`).join('\n')}

Provide a comprehensive risk assessment including:
1. Current risk level interpretation
2. Key contributing factors
3. Recommended actions
4. Risk trend prediction
5. Priority level for field intervention`;
        break;

      case 'recommendations':
        prompt = `Based on this consumer's profile, provide specific operational recommendations:
        
${JSON.stringify(unitContext, null, 2)}

Focus on:
1. Immediate actions needed
2. Collection strategies for arrears
3. Consumption pattern analysis
4. Preventive measures
5. Resource allocation priorities`;
        break;

      case 'trend_analysis':
        prompt = `Analyze consumption and risk trends for this consumer:
        
${JSON.stringify(unitContext, null, 2)}

Provide insights on:
1. Consumption pattern analysis
2. Risk score progression
3. Seasonal factors
4. Peer comparison insights
5. Future risk probability`;
        break;

      default:
        prompt = `Provide a general analysis of this electricity consumer: ${JSON.stringify(unitContext, null, 2)}`;
    }

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Calculate confidence score based on data completeness
    const dataCompleteness = [
      unit.kwh_consumption?.length > 0,
      unit.arrears !== null,
      unit.shap_drivers?.length > 0,
      unit.alert_history?.length > 0
    ].filter(Boolean).length / 4;

    const confidenceScore = Math.min(0.95, dataCompleteness * 0.8 + 0.2);

    // Store AI analysis in database
    const { error: insertError } = await supabase
      .from('ai_analysis')
      .insert({
        unit_id: unitId,
        analysis_type: analysisType,
        prompt,
        response: analysis,
        confidence_score: confidenceScore
      });

    if (insertError) {
      console.error('Error storing AI analysis:', insertError);
    }

    return new Response(
      JSON.stringify({
        analysis,
        confidence_score: confidenceScore,
        unit_context: unitContext,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in risk-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});