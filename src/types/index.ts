export type RiskTier = 'RED' | 'AMBER' | 'GREEN';

export interface Unit {
  urn: string;
  name: string;
  district: string;
  serviceNo: string;
  riskScore: number;
  tier: RiskTier;
  lastUpdated: string;
  kwhConsumption: number[];
  arrears: number;
  disconnectFlag: boolean;
  shapDrivers: Array<{
    feature: string;
    impact: number;
    value: string;
  }>;
  peerPercentile: number;
  alertHistory: Array<{
    date: string;
    type: string;
    severity: RiskTier;
  }>;
}

export interface DistrictStats {
  name: string;
  redCount: number;
  amberCount: number;
  greenCount: number;
  totalUnits: number;
  avgRiskScore: number;
  slaCompliance: number;
}

export interface StateMetrics {
  totalUnits: number;
  redAlerts: number;
  amberAlerts: number;
  greenUnits: number;
  districts: DistrictStats[];
  trendData: Array<{
    month: string;
    red: number;
    amber: number;
    green: number;
  }>;
}