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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case 'search_units':
        return await searchUnits(params);
      
      case 'advanced_filter':
        return await advancedFilter(params);
      
      case 'full_text_search':
        return await fullTextSearch(params);
      
      case 'search_suggestions':
        return await getSearchSuggestions(params);
      
      case 'search_analytics':
        return await getSearchAnalytics(params);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in advanced-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function searchUnits({ 
  query, 
  districts = [], 
  riskTiers = [], 
  riskScoreMin, 
  riskScoreMax, 
  arrearsMin, 
  arrearsMax,
  disconnectFlag,
  sortBy = 'risk_score',
  sortOrder = 'desc',
  page = 1,
  limit = 20 
}) {
  let baseQuery = supabase
    .from('units')
    .select(`
      *,
      shap_drivers(*),
      alert_history(*)
    `);

  // Text search
  if (query && query.trim()) {
    baseQuery = baseQuery.or(
      `name.ilike.%${query}%,urn.ilike.%${query}%,service_no.ilike.%${query}%,district.ilike.%${query}%`
    );
  }

  // District filter
  if (districts.length > 0) {
    baseQuery = baseQuery.in('district', districts);
  }

  // Risk tier filter
  if (riskTiers.length > 0) {
    baseQuery = baseQuery.in('tier', riskTiers);
  }

  // Risk score range
  if (riskScoreMin !== undefined) {
    baseQuery = baseQuery.gte('risk_score', riskScoreMin);
  }
  if (riskScoreMax !== undefined) {
    baseQuery = baseQuery.lte('risk_score', riskScoreMax);
  }

  // Arrears range
  if (arrearsMin !== undefined) {
    baseQuery = baseQuery.gte('arrears', arrearsMin);
  }
  if (arrearsMax !== undefined) {
    baseQuery = baseQuery.lte('arrears', arrearsMax);
  }

  // Disconnect flag filter
  if (disconnectFlag !== undefined) {
    baseQuery = baseQuery.eq('disconnect_flag', disconnectFlag);
  }

  // Sorting
  baseQuery = baseQuery.order(sortBy, { ascending: sortOrder === 'asc' });

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  baseQuery = baseQuery.range(from, to);

  const { data: units, error, count } = await baseQuery;

  if (error) throw error;

  return new Response(
    JSON.stringify({ 
      units: units || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function advancedFilter({ filters, aggregations = [] }) {
  let query = supabase.from('units').select('*');

  // Apply dynamic filters
  for (const [field, condition] of Object.entries(filters)) {
    if (condition.operator === 'eq') {
      query = query.eq(field, condition.value);
    } else if (condition.operator === 'gt') {
      query = query.gt(field, condition.value);
    } else if (condition.operator === 'lt') {
      query = query.lt(field, condition.value);
    } else if (condition.operator === 'in') {
      query = query.in(field, condition.value);
    } else if (condition.operator === 'like') {
      query = query.ilike(field, `%${condition.value}%`);
    } else if (condition.operator === 'between') {
      query = query.gte(field, condition.value[0]).lte(field, condition.value[1]);
    }
  }

  const { data: units, error } = await query;

  if (error) throw error;

  // Calculate aggregations
  const results = { units: units || [] };
  
  for (const agg of aggregations) {
    switch (agg.type) {
      case 'count':
        results[`${agg.field}_count`] = units?.length || 0;
        break;
      case 'sum':
        results[`${agg.field}_sum`] = units?.reduce((sum, unit) => sum + (unit[agg.field] || 0), 0) || 0;
        break;
      case 'avg':
        results[`${agg.field}_avg`] = units?.length ? 
          (units.reduce((sum, unit) => sum + (unit[agg.field] || 0), 0) / units.length) : 0;
        break;
      case 'min':
        results[`${agg.field}_min`] = Math.min(...(units?.map(u => u[agg.field] || 0) || [0]));
        break;
      case 'max':
        results[`${agg.field}_max`] = Math.max(...(units?.map(u => u[agg.field] || 0) || [0]));
        break;
    }
  }

  return new Response(
    JSON.stringify(results),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function fullTextSearch({ query, entityTypes = ['units'] }) {
  const results = {};

  if (entityTypes.includes('units')) {
    const { data: units } = await supabase
      .from('units')
      .select('*')
      .textSearch('name', query)
      .limit(10);
    
    results.units = units || [];
  }

  if (entityTypes.includes('reports')) {
    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5);
    
    results.reports = reports || [];
  }

  if (entityTypes.includes('notifications')) {
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .or(`title.ilike.%${query}%,message.ilike.%${query}%`)
      .limit(5);
    
    results.notifications = notifications || [];
  }

  return new Response(
    JSON.stringify(results),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getSearchSuggestions({ query, type = 'all' }) {
  const suggestions = [];

  if (type === 'all' || type === 'districts') {
    const { data: districts } = await supabase
      .from('district_stats')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(5);
    
    suggestions.push(...(districts?.map(d => ({ 
      text: d.name, 
      type: 'district',
      category: 'Districts'
    })) || []));
  }

  if (type === 'all' || type === 'units') {
    const { data: units } = await supabase
      .from('units')
      .select('name, urn')
      .or(`name.ilike.%${query}%,urn.ilike.%${query}%`)
      .limit(5);
    
    suggestions.push(...(units?.map(u => ({ 
      text: `${u.name} (${u.urn})`, 
      type: 'unit',
      category: 'Units'
    })) || []));
  }

  return new Response(
    JSON.stringify({ suggestions }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getSearchAnalytics({ timeframe = '7d' }) {
  const timeframeDays = parseInt(timeframe.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframeDays);

  // Mock analytics data - in production you'd track actual search queries
  const analytics = {
    total_searches: Math.floor(Math.random() * 1000) + 500,
    top_queries: [
      { query: 'high risk', count: 45 },
      { query: 'Chennai', count: 38 },
      { query: 'arrears', count: 32 },
      { query: 'disconnected', count: 28 },
      { query: 'RED tier', count: 25 }
    ],
    search_trends: Array.from({ length: timeframeDays }, (_, i) => ({
      date: new Date(Date.now() - (timeframeDays - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      searches: Math.floor(Math.random() * 50) + 20
    })),
    popular_filters: [
      { filter: 'risk_tier:RED', usage: 65 },
      { filter: 'district:Chennai', usage: 45 },
      { filter: 'arrears:>50000', usage: 38 },
      { filter: 'disconnect_flag:true', usage: 22 }
    ]
  };

  return new Response(
    JSON.stringify(analytics),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}