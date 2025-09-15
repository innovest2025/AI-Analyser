import { StateMetrics, DistrictStats, Unit, RiskTier } from '@/types';

export const mockStateMetrics: StateMetrics = {
  totalUnits: 45678,
  redAlerts: 1234,
  amberAlerts: 5678,
  greenUnits: 38766,
  districts: [
    {
      name: 'Chennai',
      redCount: 245,
      amberCount: 1234,
      greenCount: 8765,
      totalUnits: 10244,
      avgRiskScore: 23.5,
      slaCompliance: 95.2
    },
    {
      name: 'Coimbatore',
      redCount: 189,
      amberCount: 876,
      greenCount: 6543,
      totalUnits: 7608,
      avgRiskScore: 18.7,
      slaCompliance: 92.8
    },
    {
      name: 'Madurai',
      redCount: 167,
      amberCount: 654,
      greenCount: 5432,
      totalUnits: 6253,
      avgRiskScore: 21.2,
      slaCompliance: 89.5
    },
    {
      name: 'Erode',
      redCount: 123,
      amberCount: 543,
      greenCount: 4321,
      totalUnits: 4987,
      avgRiskScore: 19.8,
      slaCompliance: 91.3
    },
    {
      name: 'Salem',
      redCount: 145,
      amberCount: 432,
      greenCount: 3876,
      totalUnits: 4453,
      avgRiskScore: 22.1,
      slaCompliance: 88.7
    }
  ],
  trendData: [
    { month: '2024-09', red: 1156, amber: 5234, green: 39288 },
    { month: '2024-10', red: 1298, amber: 5456, green: 38924 },
    { month: '2024-11', red: 1187, amber: 5612, green: 38879 },
    { month: '2024-12', red: 1234, amber: 5678, green: 38766 },
  ]
};

export const mockUnits: Unit[] = [
  {
    urn: 'UDYAM-TN-12-0012345',
    name: 'Tamil Nadu Textiles Pvt Ltd',
    district: 'Coimbatore',
    serviceNo: 'CB001234567',
    riskScore: 89,
    tier: 'RED' as RiskTier,
    lastUpdated: '2024-12-14',
    kwhConsumption: [1250, 1180, 950, 1320, 1450, 980, 1100, 1380, 1290, 1150, 1200, 1320],
    arrears: 125000,
    disconnectFlag: false,
    shapDrivers: [
      { feature: 'Arrears Streak', impact: 0.35, value: '6 months' },
      { feature: 'Consumption Drop', impact: 0.28, value: '45% below peer avg' },
      { feature: 'Payment Irregularity', impact: 0.22, value: 'High volatility' }
    ],
    peerPercentile: 8,
    alertHistory: [
      { date: '2024-12-01', type: 'High Risk Alert', severity: 'RED' as RiskTier },
      { date: '2024-11-15', type: 'Payment Default', severity: 'AMBER' as RiskTier }
    ]
  },
  {
    urn: 'UDYAM-TN-12-0012346',
    name: 'Kovai Motors & Engineering',
    district: 'Coimbatore',
    serviceNo: 'CB001234568',
    riskScore: 72,
    tier: 'AMBER' as RiskTier,
    lastUpdated: '2024-12-14',
    kwhConsumption: [890, 920, 850, 950, 1020, 880, 900, 940, 890, 860, 910, 920],
    arrears: 45000,
    disconnectFlag: false,
    shapDrivers: [
      { feature: 'Seasonal Volatility', impact: 0.31, value: 'High variance' },
      { feature: 'Peer Comparison', impact: 0.25, value: '15% below avg' },
      { feature: 'Payment Delay', impact: 0.18, value: '2-3 days avg' }
    ],
    peerPercentile: 25,
    alertHistory: [
      { date: '2024-11-28', type: 'Medium Risk Alert', severity: 'AMBER' as RiskTier }
    ]
  },
  {
    urn: 'UDYAM-TN-12-0012347',
    name: 'South India Steels Ltd',
    district: 'Chennai',
    serviceNo: 'CH001234569',
    riskScore: 25,
    tier: 'GREEN' as RiskTier,
    lastUpdated: '2024-12-14',
    kwhConsumption: [2150, 2200, 2180, 2250, 2300, 2180, 2200, 2280, 2190, 2150, 2200, 2250],
    arrears: 0,
    disconnectFlag: false,
    shapDrivers: [
      { feature: 'Payment Consistency', impact: -0.45, value: 'Always on time' },
      { feature: 'Stable Consumption', impact: -0.25, value: 'Low volatility' },
      { feature: 'Good Credit History', impact: -0.15, value: '5+ years clean' }
    ],
    peerPercentile: 85,
    alertHistory: []
  }
];