import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { useRiskAnalysis } from '@/hooks/useRiskAnalysis';
import { Unit } from '@/types';

interface AIAnalysisProps {
  unit: Unit;
}

export function AIAnalysis({ unit }: AIAnalysisProps) {
  const { loading, error, analyzeUnit } = useRiskAnalysis();
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('risk_assessment');

  const handleAnalysis = async (analysisType: string) => {
    const unitId = unit.urn; // Using URN as ID for now
    const result = await analyzeUnit(unitId, analysisType);
    if (result) {
      setAnalysis(result);
      setActiveTab(analysisType);
    }
  };

  const formatAnalysis = (text: string) => {
    // Split the analysis into sections for better readability
    const sections = text.split('\n\n').filter(section => section.trim());
    return sections.map((section, index) => (
      <div key={index} className="mb-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{section.trim()}</p>
      </div>
    ));
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>AI-Powered Risk Analysis</CardTitle>
        </div>
        <CardDescription>
          Get intelligent insights and recommendations powered by OpenAI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="risk_assessment" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Assessment
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="trend_analysis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trend Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="risk_assessment" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Comprehensive Risk Assessment</h3>
                <Button 
                  onClick={() => handleAnalysis('risk_assessment')}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Generate Analysis'
                  )}
                </Button>
              </div>
              
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {analysis && analysis.analysis && activeTab === 'risk_assessment' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">
                      Confidence: {Math.round(analysis.confidence_score * 100)}%
                    </Badge>
                    <Badge variant="secondary">
                      Generated: {new Date(analysis.timestamp).toLocaleString()}
                    </Badge>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    {formatAnalysis(analysis.analysis)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Operational Recommendations</h3>
                <Button 
                  onClick={() => handleAnalysis('recommendations')}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Get Recommendations'
                  )}
                </Button>
              </div>

              {analysis && analysis.analysis && activeTab === 'recommendations' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">
                      Confidence: {Math.round(analysis.confidence_score * 100)}%
                    </Badge>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    {formatAnalysis(analysis.analysis)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trend_analysis" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Consumption & Risk Trends</h3>
                <Button 
                  onClick={() => handleAnalysis('trend_analysis')}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Trends'
                  )}
                </Button>
              </div>

              {analysis && analysis.analysis && activeTab === 'trend_analysis' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">
                      Confidence: {Math.round(analysis.confidence_score * 100)}%
                    </Badge>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    {formatAnalysis(analysis.analysis)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {!analysis && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select an analysis type above to get AI-powered insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}