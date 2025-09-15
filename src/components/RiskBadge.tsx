import { Badge } from '@/components/ui/badge';
import { RiskTier } from '@/types';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  tier: RiskTier;
  className?: string;
}

export function RiskBadge({ tier, className }: RiskBadgeProps) {
  const variants = {
    RED: 'bg-destructive text-destructive-foreground',
    AMBER: 'bg-warning text-warning-foreground',
    GREEN: 'bg-success text-success-foreground'
  };

  return (
    <Badge className={cn(variants[tier], className)}>
      {tier}
    </Badge>
  );
}