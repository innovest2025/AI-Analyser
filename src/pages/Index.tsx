import { useState } from 'react';
import { Header } from '@/components/Header';
import { StateOverview } from '@/components/StateOverview';
import { DistrictView } from '@/components/DistrictView';
import { UnitDetails } from '@/components/UnitDetails';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { Unit } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

type ViewState = 
  | { type: 'state' }
  | { type: 'district'; district: string }
  | { type: 'unit'; unit: Unit };

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>({ type: 'state' });
  const { units, loading, error, getUnitsByDistrict } = useSupabaseData();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  const handleDistrictSelect = (district: string) => {
    setViewState({ type: 'district', district });
  };

  const handleUnitSelect = (unit: Unit) => {
    setViewState({ type: 'unit', unit });
  };

  const handleBackToState = () => {
    setViewState({ type: 'state' });
  };

  const handleBackToDistrict = () => {
    if (viewState.type === 'unit') {
      setViewState({ type: 'district', district: viewState.unit.district });
    }
  };

  const getDistrictUnits = (district: string) => {
    return getUnitsByDistrict(district);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading risk monitoring data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading data</p>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {viewState.type === 'state' && (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">State Risk Overview</h1>
              <p className="text-muted-foreground">
                Comprehensive electricity consumer risk monitoring across Tamil Nadu districts
              </p>
            </div>
            <StateOverview onDistrictSelect={handleDistrictSelect} />
          </div>
        )}
        
        {viewState.type === 'district' && (
          <DistrictView
            district={viewState.district}
            units={getDistrictUnits(viewState.district)}
            onUnitSelect={handleUnitSelect}
            onBack={handleBackToState}
          />
        )}
        
        {viewState.type === 'unit' && (
          <UnitDetails
            unit={viewState.unit}
            onBack={handleBackToDistrict}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
