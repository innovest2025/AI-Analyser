import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';

const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--primary))'];

export function Analytics() {
  const { units, loading } = useSupabaseData();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const filteredUnits = selectedDistrict === 'all' 
    ? units 
    : units.filter(unit => unit.district === selectedDistrict);

  // Calculate metrics
  const totalUnits = filteredUnits.length;
  const redTierUnits = filteredUnits.filter(u => u.tier === 'RED').length;
  const amberTierUnits = filteredUnits.filter(u => u.tier === 'AMBER').length;
  const greenTierUnits = filteredUnits.filter(u => u.tier === 'GREEN').length;
  const disconnectedUnits = filteredUnits.filter(u => u.disconnectFlag).length;
  
  const totalArrears = filteredUnits.reduce((sum, unit) => sum + (unit.arrears || 0), 0);
  const averageRiskScore = totalUnits > 0 
    ? filteredUnits.reduce((sum, unit) => sum + unit.riskScore, 0) / totalUnits 
    : 0;

  // District breakdown - calculated from units data
  const districts = [...new Set(units.map(u => u.district))];
  const districtData = districts.map(district => {
    const districtUnits = units.filter(u => u.district === district);
    const totalUnits = districtUnits.length;
    return {
      name: district,
      total: totalUnits,
      red: districtUnits.filter(u => u.tier === 'RED').length,
      amber: districtUnits.filter(u => u.tier === 'AMBER').length,
      green: districtUnits.filter(u => u.tier === 'GREEN').length,
      avgRisk: totalUnits > 0 ? districtUnits.reduce((sum, u) => sum + u.riskScore, 0) / totalUnits : 0,
      totalArrears: districtUnits.reduce((sum, u) => sum + (u.arrears || 0), 0)
    };
  });

  console.log('Units data:', units);
  console.log('District data:', districtData);

  // Risk tier distribution
  const tierData = [
    { name: 'High Risk (RED)', value: redTierUnits, color: COLORS[0] },
    { name: 'Medium Risk (AMBER)', value: amberTierUnits, color: COLORS[1] },
    { name: 'Low Risk (GREEN)', value: greenTierUnits, color: COLORS[2] }
  ];

  // Risk trends (mock data for demonstration)
  const riskTrendData = [
    { date: '2024-01-01', red: 45, amber: 78, green: 234 },
    { date: '2024-01-08', red: 52, amber: 81, green: 221 },
    { date: '2024-01-15', red: 48, amber: 85, green: 228 },
    { date: '2024-01-22', red: 55, amber: 79, green: 218 },
    { date: '2024-01-29', red: redTierUnits, amber: amberTierUnits, green: greenTierUnits }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Risk Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive risk analysis and trends across all districts
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map(district => (
                <SelectItem key={district} value={district}>{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{totalUnits}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Units</p>
                <p className="text-2xl font-bold text-destructive">{redTierUnits}</p>
                <p className="text-xs text-muted-foreground">
                  {((redTierUnits / totalUnits) * 100).toFixed(1)}% of total
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Risk Score</p>
                <p className="text-2xl font-bold">{averageRiskScore.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  {averageRiskScore > 70 ? (
                    <TrendingUp className="h-4 w-4 text-destructive mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  <Badge variant={averageRiskScore > 70 ? 'destructive' : 'secondary'}>
                    {averageRiskScore > 70 ? 'High' : 'Moderate'}
                  </Badge>
                </div>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Arrears</p>
                <p className="text-2xl font-bold">₹{(totalArrears / 100000).toFixed(1)}L</p>
                <p className="text-xs text-muted-foreground">
                  {disconnectedUnits} disconnected units
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="districts">Districts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Tier Distribution</CardTitle>
                <CardDescription>
                  Current distribution of units across risk tiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tierData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tierData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Risk Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Score by District</CardTitle>
                <CardDescription>
                  Average risk scores across different districts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={districtData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgRisk" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="districts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>District-wise Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of risk metrics by district
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {districtData.map((district) => (
                  <Card key={district.name} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <h3 className="font-semibold">{district.name}</h3>
                      </div>
                      <Badge variant="outline">{district.total} units</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">High Risk</p>
                        <p className="text-lg font-semibold text-destructive">{district.red}</p>
                        <Progress value={(district.red / district.total) * 100} className="h-1" />
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Medium Risk</p>
                        <p className="text-lg font-semibold text-yellow-600">{district.amber}</p>
                        <Progress value={(district.amber / district.total) * 100} className="h-1" />
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Low Risk</p>
                        <p className="text-lg font-semibold text-green-600">{district.green}</p>
                        <Progress value={(district.green / district.total) * 100} className="h-1" />
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Total Arrears</p>
                        <p className="text-lg font-semibold">₹{(district.totalArrears / 100000).toFixed(1)}L</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Trend Analysis</CardTitle>
              <CardDescription>
                Historical risk tier changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="red" stroke={COLORS[0]} strokeWidth={2} name="High Risk" />
                    <Line type="monotone" dataKey="amber" stroke={COLORS[1]} strokeWidth={2} name="Medium Risk" />
                    <Line type="monotone" dataKey="green" stroke={COLORS[2]} strokeWidth={2} name="Low Risk" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}