import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from './RiskBadge';
import { Unit } from '@/types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

interface DistrictViewProps {
  district: string;
  units: Unit[];
  onUnitSelect: (unit: Unit) => void;
  onBack: () => void;
}

export function DistrictView({ district, units, onUnitSelect, onBack }: DistrictViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'riskScore' | 'arrears' | 'name'>('riskScore');

  const filteredUnits = units
    .filter(unit => 
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.urn.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'riskScore') return b.riskScore - a.riskScore;
      if (sortBy === 'arrears') return b.arrears - a.arrears;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const tierCounts = units.reduce((acc, unit) => {
    acc[unit.tier] = (acc[unit.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to State Overview
          </Button>
          <h1 className="text-3xl font-bold">{district} District</h1>
          <p className="text-muted-foreground">Risk Assessment & Alert Management</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="destructive">{tierCounts.RED || 0} Red</Badge>
          <Badge className="bg-warning text-warning-foreground">{tierCounts.AMBER || 0} Amber</Badge>
          <Badge className="bg-success text-success-foreground">{tierCounts.GREEN || 0} Green</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <CardTitle>Unit Alert List</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search units or URN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => setSortBy('name')}>
                      Unit Name <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">URN</th>
                  <th className="text-center p-2">Risk Tier</th>
                  <th className="text-right p-2">
                    <Button variant="ghost" size="sm" onClick={() => setSortBy('riskScore')}>
                      Risk Score <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </th>
                  <th className="text-right p-2">
                    <Button variant="ghost" size="sm" onClick={() => setSortBy('arrears')}>
                      Arrears <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((unit) => (
                  <tr key={unit.urn} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{unit.name}</p>
                        <p className="text-xs text-muted-foreground">{unit.serviceNo}</p>
                      </div>
                    </td>
                    <td className="p-2 text-sm font-mono">{unit.urn}</td>
                    <td className="p-2 text-center">
                      <RiskBadge tier={unit.tier} />
                    </td>
                    <td className="p-2 text-right font-bold">{unit.riskScore}</td>
                    <td className="p-2 text-right">
                      <span className={unit.arrears > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        ₹{unit.arrears.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant={unit.disconnectFlag ? 'destructive' : 'secondary'}>
                        {unit.disconnectFlag ? 'Disconnected' : 'Active'}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onUnitSelect(unit)}
                      >
                        View Details
                      </Button>
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