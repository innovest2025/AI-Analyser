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
    const { action, reportType, userId, filters = {}, reportId } = await req.json();

    switch (action) {
      case 'generate':
        return await generateReport(reportType, userId, filters);
      
      case 'get_reports':
        return await getUserReports(userId);
      
      case 'get_report':
        return await getReport(reportId, userId);
      
      case 'export':
        return await exportReport(reportId, userId);
      
      case 'schedule_daily':
        return await scheduleDailyReports();
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in reports function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateReport(reportType: string, userId: string, filters: any) {
  console.log(`Generating ${reportType} report for user ${userId}`);

  // Create report record with "generating" status
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .insert({
      generated_by: userId,
      report_type: reportType,
      title: getReportTitle(reportType),
      description: getReportDescription(reportType),
      filters,
      data: {},
      status: 'generating'
    })
    .select()
    .single();

  if (reportError) throw reportError;

  try {
    // Generate report data based on type
    let reportData;
    switch (reportType) {
      case 'daily_summary':
        reportData = await generateDailySummary(filters);
        break;
      case 'weekly_analysis':
        reportData = await generateWeeklyAnalysis(filters);
        break;
      case 'district_performance':
        reportData = await generateDistrictPerformance(filters);
        break;
      case 'risk_assessment':
        reportData = await generateRiskAssessment(filters);
        break;
      default:
        reportData = await generateCustomReport(filters);
    }

    // Update report with generated data
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        data: reportData,
        status: 'ready',
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .eq('id', report.id);

    if (updateError) throw updateError;

    // Create notification for report completion
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'report_ready',
        title: 'Report Generated Successfully',
        message: `Your ${reportType.replace('_', ' ')} report is ready for download.`,
        severity: 'MEDIUM',
        metadata: { report_id: report.id }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        report_id: report.id,
        message: 'Report generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Update report status to failed
    await supabase
      .from('reports')
      .update({ status: 'failed' })
      .eq('id', report.id);

    throw error;
  }
}

async function generateDailySummary(filters: any) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's metrics
  const { data: units } = await supabase
    .from('units')
    .select('*')
    .gte('last_updated', `${today}T00:00:00.000Z`);

  const { data: alerts } = await supabase
    .from('alert_history')
    .select('*')
    .gte('created_at', `${today}T00:00:00.000Z`);

  const summary = {
    date: today,
    total_units: units?.length || 0,
    risk_distribution: {
      red: units?.filter(u => u.tier === 'RED').length || 0,
      amber: units?.filter(u => u.tier === 'AMBER').length || 0,
      green: units?.filter(u => u.tier === 'GREEN').length || 0
    },
    alerts_today: alerts?.length || 0,
    top_risk_units: units
      ?.sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10)
      .map(u => ({
        name: u.name,
        urn: u.urn,
        district: u.district,
        risk_score: u.risk_score,
        arrears: u.arrears
      })) || [],
    district_summary: await getDistrictSummary(units || [])
  };

  return summary;
}

async function generateWeeklyAnalysis(filters: any) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: units } = await supabase
    .from('units')
    .select('*');

  const { data: alerts } = await supabase
    .from('alert_history')
    .select('*')
    .gte('created_at', weekAgo);

  // Generate AI insights for the week
  let aiInsights = '';
  if (openAIApiKey && units) {
    aiInsights = await generateAIInsights(units, 'weekly');
  }

  return {
    period: 'Last 7 days',
    generated_at: new Date().toISOString(),
    ai_insights: aiInsights,
    metrics: {
      total_units: units?.length || 0,
      alerts_this_week: alerts?.length || 0,
      risk_trends: calculateRiskTrends(units || []),
      district_performance: await getDistrictSummary(units || [])
    }
  };
}

async function generateDistrictPerformance(filters: any) {
  const { data: districtStats } = await supabase
    .from('district_stats')
    .select('*')
    .order('avg_risk_score', { ascending: false });

  const { data: units } = await supabase
    .from('units')
    .select('*');

  return {
    generated_at: new Date().toISOString(),
    districts: districtStats || [],
    detailed_analysis: districtStats?.map(district => ({
      name: district.name,
      performance_score: calculatePerformanceScore(district),
      recommendations: generateDistrictRecommendations(district),
      top_risk_units: units
        ?.filter(u => u.district === district.name)
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 5) || []
    })) || []
  };
}

async function generateRiskAssessment(filters: any) {
  const { data: units } = await supabase
    .from('units')
    .select(`
      *,
      shap_drivers(*),
      alert_history(*)
    `)
    .eq('tier', 'RED')
    .order('risk_score', { ascending: false })
    .limit(50);

  return {
    generated_at: new Date().toISOString(),
    high_risk_units: units?.map(unit => ({
      ...unit,
      risk_factors: unit.shap_drivers,
      recent_alerts: unit.alert_history?.slice(-3)
    })) || [],
    risk_summary: {
      critical_count: units?.filter(u => u.risk_score > 90).length || 0,
      high_count: units?.filter(u => u.risk_score > 80).length || 0,
      total_arrears: units?.reduce((sum, u) => sum + (u.arrears || 0), 0) || 0
    }
  };
}

async function generateCustomReport(filters: any) {
  // Generic custom report based on filters
  const { data: units } = await supabase
    .from('units')
    .select('*');

  return {
    generated_at: new Date().toISOString(),
    filters_applied: filters,
    data: units || [],
    summary: {
      total_records: units?.length || 0,
      avg_risk_score: units?.reduce((sum, u) => sum + u.risk_score, 0) / (units?.length || 1) || 0
    }
  };
}

async function getUserReports(userId: string) {
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .eq('generated_by', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  return new Response(
    JSON.stringify({ reports }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getReport(reportId: string, userId: string) {
  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .eq('generated_by', userId)
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ report }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function exportReport(reportId: string, userId: string) {
  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .eq('generated_by', userId)
    .single();

  if (!report) throw new Error('Report not found');

  // Convert report data to CSV format
  const csvData = convertToCSV(report.data);
  
  return new Response(csvData, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_')}.csv"`
    }
  });
}

async function scheduleDailyReports() {
  // This would be called via a cron job or scheduled function
  console.log('Generating scheduled daily reports...');
  
  const { data: users } = await supabase
    .from('profiles')
    .select('id, role')
    .in('role', ['admin', 'manager']);

  let reportsGenerated = 0;

  for (const user of users || []) {
    try {
      await generateReport('daily_summary', user.id, {});
      reportsGenerated++;
    } catch (error) {
      console.error(`Failed to generate report for user ${user.id}:`, error);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      reports_generated: reportsGenerated 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper functions
function getReportTitle(reportType: string): string {
  const titles = {
    daily_summary: 'Daily Risk Summary',
    weekly_analysis: 'Weekly Risk Analysis',
    district_performance: 'District Performance Report',
    risk_assessment: 'High Risk Assessment',
    custom: 'Custom Report'
  };
  return titles[reportType as keyof typeof titles] || 'Report';
}

function getReportDescription(reportType: string): string {
  const descriptions = {
    daily_summary: 'Daily overview of risk metrics and alerts',
    weekly_analysis: 'Weekly trend analysis with AI insights',
    district_performance: 'Comprehensive district performance analysis',
    risk_assessment: 'Detailed assessment of high-risk units',
    custom: 'Custom analysis based on specified filters'
  };
  return descriptions[reportType as keyof typeof descriptions] || 'Custom report';
}

async function getDistrictSummary(units: any[]) {
  const districts = [...new Set(units.map(u => u.district))];
  return districts.map(district => {
    const districtUnits = units.filter(u => u.district === district);
    return {
      name: district,
      total_units: districtUnits.length,
      avg_risk_score: districtUnits.reduce((sum, u) => sum + u.risk_score, 0) / districtUnits.length,
      red_count: districtUnits.filter(u => u.tier === 'RED').length,
      amber_count: districtUnits.filter(u => u.tier === 'AMBER').length,
      green_count: districtUnits.filter(u => u.tier === 'GREEN').length
    };
  });
}

function calculateRiskTrends(units: any[]) {
  // Simplified trend calculation - in reality would use historical data
  return {
    improving: units.filter(u => u.risk_score < 50).length,
    stable: units.filter(u => u.risk_score >= 50 && u.risk_score < 80).length,
    deteriorating: units.filter(u => u.risk_score >= 80).length
  };
}

function calculatePerformanceScore(district: any): number {
  // Simple performance score calculation
  const riskWeight = (100 - district.avg_risk_score) * 0.4;
  const complianceWeight = district.sla_compliance * 0.3;
  const alertWeight = Math.max(0, 100 - (district.red_count * 10)) * 0.3;
  
  return Math.round(riskWeight + complianceWeight + alertWeight);
}

function generateDistrictRecommendations(district: any): string[] {
  const recommendations = [];
  
  if (district.avg_risk_score > 70) {
    recommendations.push('Increase field team presence for high-risk unit management');
  }
  if (district.red_count > 10) {
    recommendations.push('Implement immediate intervention program for critical alerts');
  }
  if (district.sla_compliance < 90) {
    recommendations.push('Review and improve service delivery processes');
  }
  
  return recommendations;
}

async function generateAIInsights(units: any[], period: string): Promise<string> {
  if (!openAIApiKey) return 'AI insights unavailable - OpenAI API key not configured';

  const prompt = `Analyze this electricity consumer risk data for ${period} insights:

Total Units: ${units.length}
Risk Distribution:
- RED: ${units.filter(u => u.tier === 'RED').length}
- AMBER: ${units.filter(u => u.tier === 'AMBER').length}  
- GREEN: ${units.filter(u => u.tier === 'GREEN').length}

Average Risk Score: ${(units.reduce((sum, u) => sum + u.risk_score, 0) / units.length).toFixed(2)}

Top Risk Districts: ${[...new Set(units.filter(u => u.tier === 'RED').map(u => u.district))].slice(0, 5).join(', ')}

Provide 3-4 key insights and actionable recommendations for TANGEDCO operations team.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI expert in electricity distribution analytics. Provide concise, actionable insights.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return 'AI insights generation failed';
  }
}

function convertToCSV(data: any): string {
  if (!data || typeof data !== 'object') return '';
  
  // Simple CSV conversion - would be more robust in production
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }
  
  // For object data, convert to key-value CSV
  const entries = Object.entries(data);
  return 'Key,Value\n' + entries.map(([key, value]) => 
    `"${key}","${typeof value === 'object' ? JSON.stringify(value) : value}"`
  ).join('\n');
}