import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, X, Download, BarChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Unit } from '@/types';

interface SearchFilters {
  query: string;
  districts: string[];
  riskTiers: string[];
  riskScoreMin: number | undefined;
  riskScoreMax: number | undefined;
  arrearsMin: number | undefined;
  arrearsMax: number | undefined;
  disconnectFlag: boolean | undefined;
}

interface SearchResults {
  units: Unit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const DISTRICTS = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy', 'Erode', 'Tirunelveli'];
const RISK_TIERS = ['RED', 'AMBER', 'GREEN'];

export function AdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    districts: [],
    riskTiers: [],
    riskScoreMin: undefined,
    riskScoreMax: undefined,
    arrearsMin: undefined,
    arrearsMax: undefined,
    disconnectFlag: undefined,
  });

  const [results, setResults] = useState<SearchResults>({
    units: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 }
  });

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { user, logActivity } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (filters.query && filters.query.length > 2) {
      getSuggestions(filters.query);
    } else {
      setSuggestions([]);
    }
  }, [filters.query]);

  const getSuggestions = async (query: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('advanced-search', {
        body: { action: 'search_suggestions', query, type: 'all' }
      });

      if (error) throw error;
      setSuggestions(data.suggestions.map((s: any) => s.text));
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const performSearch = async (page = 1) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('advanced-search', {
        body: {
          action: 'search_units',
          ...filters,
          sortBy,
          sortOrder,
          page,
          limit: 20
        }
      });

      if (error) throw error;

      setResults(data);
      setCurrentPage(page);

      await logActivity('advanced_search', `Searched units with query: "${filters.query}"`);

      toast({
        title: 'Search Complete',
        description: `Found ${data.pagination.total} units matching your criteria`,
      });

    } catch (error) {
      console.error('Error performing search:', error);
      toast({
        title: 'Search Failed',
        description: 'An error occurred while searching',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      districts: [],
      riskTiers: [],
      riskScoreMin: undefined,
      riskScoreMax: undefined,
      arrearsMin: undefined,
      arrearsMax: undefined,
      disconnectFlag: undefined,
    });
    setResults({ units: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
  };

  const exportResults = async () => {
    if (results.units.length === 0) return;

    const csvContent = [
      ['Name', 'URN', 'District', 'Risk Score', 'Tier', 'Arrears', 'Status'].join(','),
      ...results.units.map(unit => [
        unit.name,
        unit.urn,
        unit.district,
        unit.riskScore,
        unit.tier,
        unit.arrears,
        unit.disconnectFlag ? 'Disconnected' : 'Active'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    await logActivity('export_search', 'Exported search results to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advanced Search</h1>
          <p className="text-muted-foreground">
            Find units using comprehensive filters and AI-powered search
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Search Filters
              </CardTitle>
              <CardDescription>
                Refine your search criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Text Search */}
              <div className="space-y-2">
                <Label>Search Query</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search units, URNs, districts..."
                    value={filters.query}
                    onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                    className="pl-10"
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-md z-50 max-h-32 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                          onClick={() => {
                            setFilters({ ...filters, query: suggestion });
                            setSuggestions([]);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Districts */}
              <div className="space-y-2">
                <Label>Districts</Label>
                <div className="space-y-2">
                  {DISTRICTS.map((district) => (
                    <div key={district} className="flex items-center space-x-2">
                      <Checkbox
                        id={district}
                        checked={filters.districts.includes(district)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters({ ...filters, districts: [...filters.districts, district] });
                          } else {
                            setFilters({ ...filters, districts: filters.districts.filter(d => d !== district) });
                          }
                        }}
                      />
                      <Label htmlFor={district} className="text-sm">{district}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Tiers */}
              <div className="space-y-2">
                <Label>Risk Tiers</Label>
                <div className="space-y-2">
                  {RISK_TIERS.map((tier) => (
                    <div key={tier} className="flex items-center space-x-2">
                      <Checkbox
                        id={tier}
                        checked={filters.riskTiers.includes(tier)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters({ ...filters, riskTiers: [...filters.riskTiers, tier] });
                          } else {
                            setFilters({ ...filters, riskTiers: filters.riskTiers.filter(t => t !== tier) });
                          }
                        }}
                      />
                      <Label htmlFor={tier} className="text-sm">
                        <Badge variant={tier === 'RED' ? 'destructive' : tier === 'AMBER' ? 'default' : 'secondary'}>
                          {tier}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Score Range */}
              <div className="space-y-2">
                <Label>Risk Score Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.riskScoreMin || ''}
                    onChange={(e) => setFilters({ ...filters, riskScoreMin: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.riskScoreMax || ''}
                    onChange={(e) => setFilters({ ...filters, riskScoreMax: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>

              {/* Arrears Range */}
              <div className="space-y-2">
                <Label>Arrears Range (₹)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.arrearsMin || ''}
                    onChange={(e) => setFilters({ ...filters, arrearsMin: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.arrearsMax || ''}
                    onChange={(e) => setFilters({ ...filters, arrearsMax: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>

              {/* Connection Status */}
              <div className="space-y-2">
                <Label>Connection Status</Label>
                <Select 
                  value={filters.disconnectFlag === undefined ? '' : (filters.disconnectFlag ? 'disconnected' : 'active')}
                  onValueChange={(value) => {
                    if (value === '') {
                      setFilters({ ...filters, disconnectFlag: undefined });
                    } else {
                      setFilters({ ...filters, disconnectFlag: value === 'disconnected' });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => performSearch(1)} className="flex-1" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>
                    {results.pagination.total > 0 && (
                      `Found ${results.pagination.total} units • Page ${results.pagination.page} of ${results.pagination.pages}`
                    )}
                  </CardDescription>
                </div>
                
                {results.units.length > 0 && (
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="risk_score">Risk Score</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="district">District</SelectItem>
                        <SelectItem value="arrears">Arrears</SelectItem>
                        <SelectItem value="last_updated">Last Updated</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Desc</SelectItem>
                        <SelectItem value="asc">Asc</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" onClick={exportResults}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : results.units.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    {Object.values(filters).some(v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true))
                      ? 'No units found matching your criteria'
                      : 'Enter search criteria to find units'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-3">
                      {results.units.map((unit) => (
                        <Card key={unit.urn} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{unit.name}</h3>
                                  <Badge variant={
                                    unit.tier === 'RED' ? 'destructive' : 
                                    unit.tier === 'AMBER' ? 'default' : 'secondary'
                                  }>
                                    {unit.tier}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-medium">URN:</span> {unit.urn}
                                  </div>
                                  <div>
                                    <span className="font-medium">District:</span> {unit.district}
                                  </div>
                                  <div>
                                    <span className="font-medium">Arrears:</span> ₹{unit.arrears.toLocaleString()}
                                  </div>
                                  <div>
                                    <span className="font-medium">Status:</span> {unit.disconnectFlag ? 'Disconnected' : 'Active'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-2xl font-bold">{unit.riskScore}</div>
                                <div className="text-xs text-muted-foreground">Risk Score</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Pagination */}
                  {results.pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => performSearch(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        Previous
                      </Button>
                      
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {results.pagination.pages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => performSearch(currentPage + 1)}
                        disabled={currentPage === results.pagination.pages || loading}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}