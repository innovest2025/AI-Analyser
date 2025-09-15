import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { RiskBadge } from './RiskBadge';
import { Unit } from '@/types';
import { Calendar, TrendingDown, AlertCircle, FileText } from 'lucide-react';
import { useState } from 'react';

interface UnitDetailsProps {
  unit: Unit;
  onBack: () => void;
}

export function UnitDetails({ unit, onBack }: UnitDetailsProps) {
  const [note, setNote] = useState('');

  const consumptionData = unit.kwhConsumption.map((kwh, index) => ({
    month: `Month ${index + 1}`,
    kwh
  }));

  const shapData = unit.shapDrivers.map(driver => ({
    feature: driver.feature,
    impact: Math.abs(driver.impact),
    isPositive: driver.impact < 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to District View
          </Button>
          <h1 className="text-3xl font-bold">{unit.name}</h1>
          <p className="text-muted-foreground">URN: {unit.urn} | Service: {unit.serviceNo}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Risk Score:</span>
            <span className="text-2xl font-bold">{unit.riskScore}</span>
            <RiskBadge tier={unit.tier} />
          </div>
          <p className="text-sm text-muted-foreground">
            Peer Percentile: {unit.peerPercentile}th
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              24-Month Consumption Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="kwh" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unit Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">District</p>
              <p className="font-medium">{unit.district}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Arrears</p>
              <p className="font-medium text-destructive">₹{unit.arrears.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connection Status</p>
              <Badge variant={unit.disconnectFlag ? 'destructive' : 'secondary'}>
                {unit.disconnectFlag ? 'Disconnected' : 'Active'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {unit.lastUpdated}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              SHAP Risk Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={shapData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="feature" type="category" width={120} />
                <Tooltip />
                <Bar 
                  dataKey="impact" 
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {unit.shapDrivers.map((driver, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm font-medium">{driver.feature}</span>
                  <span className="text-sm text-muted-foreground">{driver.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Alert History</h4>
              {unit.alertHistory.length > 0 ? (
                <div className="space-y-2">
                  {unit.alertHistory.map((alert, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <p className="text-sm font-medium">{alert.type}</p>
                        <p className="text-xs text-muted-foreground">{alert.date}</p>
                      </div>
                      <RiskBadge tier={alert.severity} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No alerts recorded</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Add Case Note</h4>
              <Textarea 
                placeholder="Record outreach, outcomes, or observations..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mb-2"
              />
              <Button size="sm" className="w-full">
                Save Note
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}