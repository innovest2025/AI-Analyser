import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Unit, DistrictStats } from '@/types';

export const useSupabaseData = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          shap_drivers(*),
          alert_history(*)
        `)
        .order('risk_score', { ascending: false });

      if (error) throw error;

      // Transform data to match existing Unit interface
      const transformedUnits: Unit[] = (data || []).map(unit => ({
        urn: unit.urn,
        name: unit.name,
        district: unit.district,
        serviceNo: unit.service_no,
        riskScore: unit.risk_score,
        tier: unit.tier as Unit['tier'],
        lastUpdated: unit.last_updated,
        kwhConsumption: unit.kwh_consumption || [],
        arrears: unit.arrears || 0,
        disconnectFlag: unit.disconnect_flag || false,
        shapDrivers: (unit.shap_drivers || []).map((driver: any) => ({
          feature: driver.feature,
          impact: driver.impact,
          value: driver.value
        })),
        peerPercentile: unit.peer_percentile || 50,
        alertHistory: (unit.alert_history || []).map((alert: any) => ({
          date: alert.date,
          type: alert.type,
          severity: alert.severity as Unit['alertHistory'][0]['severity']
        }))
      }));

      setUnits(transformedUnits);
    } catch (err) {
      console.error('Error fetching units:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch units');
    }
  };

  const fetchDistrictStats = async () => {
    try {
      const { data, error } = await supabase
        .from('district_stats')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transform data to match existing DistrictStats interface
      const transformedStats: DistrictStats[] = (data || []).map(stat => ({
        name: stat.name,
        redCount: stat.red_count,
        amberCount: stat.amber_count,
        greenCount: stat.green_count,
        totalUnits: stat.total_units,
        avgRiskScore: stat.avg_risk_score,
        slaCompliance: stat.sla_compliance
      }));

      setDistrictStats(transformedStats);
    } catch (err) {
      console.error('Error fetching district stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch district stats');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      fetchUnits(),
      fetchDistrictStats()
    ]);
    
    setLoading(false);
  };

  const getUnitsByDistrict = (district: string): Unit[] => {
    return units.filter(unit => unit.district === district);
  };

  const getStateMetrics = () => {
    const totalUnits = units.length;
    const redAlerts = units.filter(u => u.tier === 'RED').length;
    const amberAlerts = units.filter(u => u.tier === 'AMBER').length;
    const greenUnits = units.filter(u => u.tier === 'GREEN').length;

    return {
      totalUnits,
      redAlerts,
      amberAlerts,
      greenUnits,
      districts: districtStats,
      trendData: [] // This could be enhanced with historical data
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const unitsChannel = supabase
      .channel('units-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'units'
      }, () => {
        fetchUnits();
      })
      .subscribe();

    const statsChannel = supabase
      .channel('stats-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'district_stats'
      }, () => {
        fetchDistrictStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(unitsChannel);
      supabase.removeChannel(statsChannel);
    };
  }, []);

  return {
    units,
    districtStats,
    loading,
    error,
    getUnitsByDistrict,
    getStateMetrics,
    refreshData: fetchData
  };
};