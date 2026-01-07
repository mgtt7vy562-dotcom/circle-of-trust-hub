import React from 'react';
import { Coins, Gift, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const REWARD_TIERS = [
  { points: 100, value: 10, name: '$10 Gift Card' },
  { points: 200, value: 25, name: '$25 Amazon Voucher' },
  { points: 500, value: 75, name: '$75 Premium Reward' },
  { points: 1000, value: 200, name: '$200 Grand Prize' }
];

export const PointsDisplay = ({ points = 0, showProgress = true, compact = false }) => {
  const nextTier = REWARD_TIERS.find(t => t.points > points) || REWARD_TIERS[REWARD_TIERS.length - 1];
  const prevTier = REWARD_TIERS.filter(t => t.points <= points).pop();
  const progress = prevTier 
    ? ((points - prevTier.points) / (nextTier.points - prevTier.points)) * 100
    : (points / nextTier.points) * 100;
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-yellow-500" />
        <span className="font-bold text-yellow-600">{points.toLocaleString()}</span>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-200">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-yellow-700 font-medium">Your Points</p>
            <p className="text-3xl font-bold text-yellow-900">{points.toLocaleString()}</p>
          </div>
        </div>
        <TrendingUp className="w-8 h-8 text-yellow-400" />
      </div>
      
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-yellow-700">Progress to {nextTier.name}</span>
            <span className="font-medium text-yellow-900">{points} / {nextTier.points}</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-3 bg-yellow-200" />
          <p className="text-xs text-yellow-600 flex items-center gap-1">
            <Gift className="w-3 h-3" />
            {nextTier.points - points} points until next reward
          </p>
        </div>
      )}
    </div>
  );
};

export const POINTS_PER_REFERRAL = 25;
export { REWARD_TIERS };
export default PointsDisplay;