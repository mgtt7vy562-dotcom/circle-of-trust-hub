import React from 'react';
import { Shield, Award, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const RANK_CONFIG = {
  bronze: {
    icon: Shield,
    label: 'Bronze',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    minScore: 0
  },
  silver: {
    icon: Award,
    label: 'Silver',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    minScore: 100
  },
  gold: {
    icon: Crown,
    label: 'Gold',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    minScore: 250
  },
  platinum: {
    icon: Star,
    label: 'Platinum',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-400',
    minScore: 500
  }
};

export const calculateTrustRank = (score) => {
  if (score >= 500) return 'platinum';
  if (score >= 250) return 'gold';
  if (score >= 100) return 'silver';
  return 'bronze';
};

export const TrustBadge = ({ rank = 'bronze', size = 'md', showLabel = true }) => {
  const config = RANK_CONFIG[rank] || RANK_CONFIG.bronze;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      config.bgColor,
      config.borderColor,
      config.color,
      sizeClasses[size]
    )}>
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};

export default TrustBadge;