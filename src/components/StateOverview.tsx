import { MetricCard } from './MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertTriangle, TrendingUp, Users, Shield } from 'lucide-react';
import { mockStateMetrics } from '@/lib/mockData';

interface StateOverviewProps {
  onDistrictSelect?: (district: string) => void;
}

export function StateOverview({ onDistrictSelect }: StateOverviewProps) {
  const metrics = mockStateMetrics;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Units"
          value={metrics.totalUnits.toLocaleString()}
          icon={Users}
          trend={{ value: 2.3, label: 'from last month' }}
        />
        <MetricCard
          title="Red Alerts"
          value={metrics.redAlerts.toLocaleString()}
          icon={AlertTriangle}
          trend={{ value: -5.2, label: 'from last month' }}
        />
        <MetricCard
          title="Amber Alerts"
          value={metrics.amberAlerts.toLocaleString()}
          icon={TrendingUp}
          trend={{ value: 1.8, label: 'from last month' }}
        />
        <MetricCard
          title="Healthy Units"
          value={metrics.greenUnits.toLocaleString()}
          icon={Shield}
          trend={{ value: 3.1, label: 'from last month' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution by District</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.districts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="redCount" fill="hsl(var(--destructive))" name="Red" />
                <Bar dataKey="amberCount" fill="hsl(var(--warning))" name="Amber" />
                <Bar dataKey="greenCount" fill="hsl(var(--success))" name="Green" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Trends (Last 4 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="red" stroke="hsl(var(--destructive))" name="Red" strokeWidth={2} />
                <Line type="monotone" dataKey="amber" stroke="hsl(var(--warning))" name="Amber" strokeWidth={2} />
                <Line type="monotone" dataKey="green" stroke="hsl(var(--success))" name="Green" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>District Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">District</th>
                  <th className="text-right p-2">Total Units</th>
                  <th className="text-right p-2">Avg Risk Score</th>
                  <th className="text-right p-2">SLA Compliance</th>
                  <th className="text-right p-2">Red Alerts</th>
                </tr>
              </thead>
              <tbody>
                {metrics.districts.map((district) => (
                  <tr 
                    key={district.name} 
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => onDistrictSelect?.(district.name)}
                  >
                    <td className="p-2 font-medium text-primary hover:underline">{district.name}</td>
                    <td className="p-2 text-right">{district.totalUnits.toLocaleString()}</td>
                    <td className="p-2 text-right">{district.avgRiskScore}</td>
                    <td className="p-2 text-right">
                      <span className={district.slaCompliance > 90 ? 'text-success' : 'text-warning'}>
                        {district.slaCompliance}%
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <span className="text-destructive font-medium">{district.redCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}