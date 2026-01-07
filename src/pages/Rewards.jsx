import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Gift, 
  Coins, 
  Trophy,
  ArrowLeft,
  Loader2,
  Check,
  ShoppingBag,
  Coffee,
  CreditCard,
  Sparkles,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PointsDisplay, REWARD_TIERS } from '@/components/shared/PointsDisplay';
import { toast } from 'sonner';

const AVAILABLE_REWARDS = [
  {
    id: 'amazon_10',
    name: '$10 Amazon Gift Card',
    description: 'Redeemable on Amazon.com',
    points: 100,
    value: 10,
    icon: ShoppingBag,
    color: 'bg-orange-500',
    partner: 'Amazon'
  },
  {
    id: 'starbucks_10',
    name: '$10 Starbucks Card',
    description: 'Good for any Starbucks location',
    points: 100,
    value: 10,
    icon: Coffee,
    color: 'bg-green-600',
    partner: 'Starbucks'
  },
  {
    id: 'amazon_25',
    name: '$25 Amazon Gift Card',
    description: 'Redeemable on Amazon.com',
    points: 200,
    value: 25,
    icon: ShoppingBag,
    color: 'bg-orange-500',
    partner: 'Amazon'
  },
  {
    id: 'visa_25',
    name: '$25 Visa Gift Card',
    description: 'Use anywhere Visa is accepted',
    points: 250,
    value: 25,
    icon: CreditCard,
    color: 'bg-blue-600',
    partner: 'Visa'
  },
  {
    id: 'amazon_50',
    name: '$50 Amazon Gift Card',
    description: 'Redeemable on Amazon.com',
    points: 400,
    value: 50,
    icon: ShoppingBag,
    color: 'bg-orange-500',
    partner: 'Amazon'
  },
  {
    id: 'premium_100',
    name: '$100 Premium Reward',
    description: 'Choice of major retailer gift cards',
    points: 750,
    value: 100,
    icon: Star,
    color: 'bg-purple-600',
    partner: 'Various'
  }
];

export default function Rewards() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  
  useEffect(() => {
    const init = async () => {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) {
        base44.auth.redirectToLogin(createPageUrl('Rewards'));
        return;
      }
      
      const userData = await base44.auth.me();
      setUser(userData);
      
      const profiles = await base44.entities.CustomerProfile.filter({ user_email: userData.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
      setLoading(false);
    };
    init();
  }, []);
  
  const { data: myRewards = [] } = useQuery({
    queryKey: ['my-rewards', profile?.user_email],
    queryFn: () => base44.entities.Reward.filter({ customer_email: profile.user_email }, '-created_date', 20),
    enabled: !!profile
  });
  
  const handleRedeem = async (reward) => {
    if (!profile || (profile.total_points || 0) < reward.points) {
      toast.error('Not enough points');
      return;
    }
    
    setRedeeming(true);
    
    // Create reward record
    const redemptionCode = `RWD${Date.now().toString(36).toUpperCase()}`;
    await base44.entities.Reward.create({
      customer_email: profile.user_email,
      reward_type: 'gift_card',
      reward_name: reward.name,
      points_cost: reward.points,
      value_amount: reward.value,
      status: 'pending',
      redemption_code: redemptionCode,
      partner: reward.partner
    });
    
    // Deduct points
    const newPoints = (profile.total_points || 0) - reward.points;
    const newRedeemed = (profile.redeemed_points || 0) + reward.points;
    await base44.entities.CustomerProfile.update(profile.id, {
      total_points: newPoints,
      redeemed_points: newRedeemed
    });
    
    setProfile(prev => ({ ...prev, total_points: newPoints, redeemed_points: newRedeemed }));
    setSelectedReward(null);
    setRedeeming(false);
    
    toast.success('Reward redeemed! Check your email for delivery details.');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl('CustomerDashboard')}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Rewards Store</h1>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6">
                <Coins className="w-10 h-10 mb-3" />
                <p className="text-4xl font-bold">{profile?.total_points || 0}</p>
                <p className="text-white/80">Available Points</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6">
                <Gift className="w-10 h-10 mb-3" />
                <p className="text-4xl font-bold">{profile?.redeemed_points || 0}</p>
                <p className="text-white/80">Points Redeemed</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6">
                <Trophy className="w-10 h-10 mb-3" />
                <p className="text-4xl font-bold">{profile?.successful_referrals || 0}</p>
                <p className="text-white/80">Successful Referrals</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Available Rewards */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Available Rewards
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {AVAILABLE_REWARDS.map((reward, idx) => {
            const canRedeem = (profile?.total_points || 0) >= reward.points;
            const Icon = reward.icon;
            
            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`relative overflow-hidden h-full ${canRedeem ? '' : 'opacity-75'}`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${reward.color} opacity-10 rounded-bl-full`} />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 ${reward.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge variant="secondary" className="font-bold">
                        {reward.points} pts
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-1">{reward.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{reward.description}</p>
                    
                    {canRedeem ? (
                      <Button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => setSelectedReward(reward)}
                      >
                        Redeem Now
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Progress 
                          value={((profile?.total_points || 0) / reward.points) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500 text-center">
                          {reward.points - (profile?.total_points || 0)} more points needed
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        {/* Redemption History */}
        <h2 className="text-2xl font-bold mb-6">Redemption History</h2>
        
        {myRewards.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No rewards redeemed yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start referring businesses to earn points!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myRewards.map(reward => (
              <Card key={reward.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Gift className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{reward.reward_name}</p>
                      <p className="text-sm text-gray-500">{reward.points_cost} points</p>
                    </div>
                  </div>
                  <Badge variant={
                    reward.status === 'delivered' ? 'default' :
                    reward.status === 'processed' ? 'secondary' : 'outline'
                  }>
                    {reward.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Redemption Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              You're about to redeem {selectedReward?.name} for {selectedReward?.points} points.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              {selectedReward && (
                <>
                  <div className={`w-14 h-14 ${selectedReward.color} rounded-xl flex items-center justify-center`}>
                    <selectedReward.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">{selectedReward.name}</p>
                    <p className="text-sm text-gray-500">Value: ${selectedReward.value}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4 p-4 border rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Your points</span>
                <span className="font-medium">{profile?.total_points || 0}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Cost</span>
                <span className="font-medium text-red-500">-{selectedReward?.points}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">Remaining</span>
                <span className="font-bold">{(profile?.total_points || 0) - (selectedReward?.points || 0)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setSelectedReward(null)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => handleRedeem(selectedReward)}
              disabled={redeeming}
            >
              {redeeming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}