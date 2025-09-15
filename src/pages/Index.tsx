import { useState } from 'react';
import { Header } from '@/components/Header';
import { StateOverview } from '@/components/StateOverview';
import { DistrictView } from '@/components/DistrictView';
import { UnitDetails } from '@/components/UnitDetails';
import { mockUnits } from '@/lib/mockData';
import { Unit } from '@/types';

type ViewState = 
  | { type: 'state' }
  | { type: 'district'; district: string }
  | { type: 'unit'; unit: Unit };

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>({ type: 'state' });

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
    return mockUnits.filter(unit => unit.district === district);
  };

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
