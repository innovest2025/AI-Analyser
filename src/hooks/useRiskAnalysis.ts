import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResult {
  analysis: string;
  confidence_score: number;
  unit_context: any;
  timestamp: string;
}

interface TrendPrediction {
  prediction: string;
  confidence_score: number;
  analysis_metadata: {
    scope: string;
    district?: string;
    timeframe: string;
    units_analyzed: number;
  };
  trend_summary: any;
  timestamp: string;
}

export const useRiskAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeUnit = async (unitId: string, analysisType: string = 'risk_assessment'): Promise<AnalysisResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('risk-analysis', {
        body: { unitId, analysisType }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze unit';
      setError(errorMessage);
      console.error('Risk analysis error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const predictTrends = async (scope: string = 'district', district?: string, timeframe: string = '3_months'): Promise<TrendPrediction | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('trend-prediction', {
        body: { scope, district, timeframe }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict trends';
      setError(errorMessage);
      console.error('Trend prediction error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const syncData = async (action: string = 'sync_all') => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('data-sync', {
        body: { action }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync data';
      setError(errorMessage);
      console.error('Data sync error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    analyzeUnit,
    predictTrends,
    syncData
  };
};