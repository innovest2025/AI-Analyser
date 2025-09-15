import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Calendar, Clock, Filter, Plus, Loader2, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  report_type: string;
  title: string;
  description: string;
  status: 'generating' | 'ready' | 'failed' | 'archived';
  generated_at: string | null;
  created_at: string;
  filters: any;
  data: any;
}

export function ReportsDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [showGenerator, setShowGenerator] = useState(false);
  
  const { user, logActivity } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reports', {
        body: { action: 'get_reports', userId: user.id }
      });

      if (error) throw error;

      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    if (!user) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('reports', {
        body: { 
          action: 'generate', 
          reportType, 
          userId: user.id,
          filters: {}
        }
      });

      if (error) throw error;

      toast({
        title: 'Report Generation Started',
        description: 'Your report is being generated. You will be notified when it\'s ready.',
      });

      await logActivity('generate_report', `Generated ${reportType} report`);
      setShowGenerator(false);
      
      // Refresh reports after a short delay
      setTimeout(fetchReports, 2000);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = async (reportId: string, title: string) => {
    if (!user) return;

    try {
      const response = await supabase.functions.invoke('reports', {
        body: { action: 'export', reportId, userId: user.id }
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      await logActivity('export_report', `Exported report: ${title}`);
      
      toast({
        title: 'Export Complete',
        description: 'Report has been downloaded successfully',
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export report',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="secondary" className="bg-success/10 text-success">Ready</Badge>;
      case 'generating':
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Generating</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels = {
      daily_summary: 'Daily Summary',
      weekly_analysis: 'Weekly Analysis',
      monthly_review: 'Monthly Review',
      district_performance: 'District Performance',
      risk_assessment: 'Risk Assessment',
      custom: 'Custom Report'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not generated';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports Dashboard</h2>
          <p className="text-muted-foreground">
            Generate and manage risk monitoring reports
          </p>
        </div>
        
        <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Generate Report
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Select the type of report you want to generate
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Report Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily_summary">Daily Summary</SelectItem>
                    <SelectItem value="weekly_analysis">Weekly Analysis</SelectItem>
                    <SelectItem value="district_performance">District Performance</SelectItem>
                    <SelectItem value="risk_assessment">High Risk Assessment</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowGenerator(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedType && generateReport(selectedType)}
                  disabled={!selectedType || generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <FileText className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground">No reports generated yet</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => setShowGenerator(true)}
            >
              Generate Your First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">
                      {getReportTypeLabel(report.report_type)}
                    </CardTitle>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(report.created_at)}</span>
                </div>
                
                {report.generated_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Generated: {formatDate(report.generated_at)}</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {report.status === 'ready' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => exportReport(report.id, report.title)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  )}
                  
                  {report.status === 'generating' && (
                    <Button size="sm" variant="outline" disabled className="flex-1">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </Button>
                  )}
                  
                  {report.status === 'failed' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => generateReport(report.report_type)}
                      className="flex-1"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}