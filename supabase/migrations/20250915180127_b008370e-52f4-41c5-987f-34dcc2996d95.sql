-- Create units table for electricity consumer data
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  urn TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  service_no TEXT NOT NULL,
  risk_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  tier TEXT NOT NULL CHECK (tier IN ('RED', 'AMBER', 'GREEN')),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  kwh_consumption DECIMAL[] DEFAULT '{}',
  arrears DECIMAL(12,2) DEFAULT 0,
  disconnect_flag BOOLEAN DEFAULT false,
  peer_percentile INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SHAP drivers table for AI explainability
CREATE TABLE public.shap_drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  impact DECIMAL(8,4) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alert history table
CREATE TABLE public.alert_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('RED', 'AMBER', 'GREEN')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI analysis table for storing OpenAI insights
CREATE TABLE public.ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  confidence_score DECIMAL(5,4),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create district performance summary table
CREATE TABLE public.district_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  red_count INTEGER DEFAULT 0,
  amber_count INTEGER DEFAULT 0,
  green_count INTEGER DEFAULT 0,
  total_units INTEGER DEFAULT 0,
  avg_risk_score DECIMAL(5,2) DEFAULT 0,
  sla_compliance DECIMAL(5,2) DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shap_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_stats ENABLE ROW LEVEL SECURITY;

-- Create public access policies (since this is operational monitoring data)
CREATE POLICY "Allow public read access to units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Allow public read access to shap_drivers" ON public.shap_drivers FOR SELECT USING (true);
CREATE POLICY "Allow public read access to alert_history" ON public.alert_history FOR SELECT USING (true);
CREATE POLICY "Allow public read access to ai_analysis" ON public.ai_analysis FOR SELECT USING (true);
CREATE POLICY "Allow public read access to district_stats" ON public.district_stats FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_units_district ON public.units(district);
CREATE INDEX idx_units_tier ON public.units(tier);
CREATE INDEX idx_units_risk_score ON public.units(risk_score DESC);
CREATE INDEX idx_shap_drivers_unit_id ON public.shap_drivers(unit_id);
CREATE INDEX idx_alert_history_unit_id ON public.alert_history(unit_id);
CREATE INDEX idx_alert_history_date ON public.alert_history(date DESC);
CREATE INDEX idx_ai_analysis_unit_id ON public.ai_analysis(unit_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_district_stats_updated_at
  BEFORE UPDATE ON public.district_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();