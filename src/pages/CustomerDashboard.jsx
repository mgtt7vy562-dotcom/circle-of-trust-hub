import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2, 
  Heart, 
  Gift, 
  Trophy, 
  Users,
  ChevronRight,
  Plus,
  Loader2,
  Sparkles,
  Star,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PointsDisplay, REWARD_TIERS, POINTS_PER_REFERRAL } from '@/components/shared/PointsDisplay';
import { BusinessCard } from '@/components/business/BusinessCard';
import { ReferralShareModal } from '@/components/referral/ReferralShareModal';
import { toast } from 'sonner';

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const init = async () => {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) {
        base44.auth.redirectToLogin(createPageUrl('CustomerDashboard'));
        return;
      }
      
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Check/create customer profile
      const profiles = await base44.entities.CustomerProfile.filter({ user_email: userData.email });
      if (profiles.length === 0) {
        // Create new profile with unique referral code
        const code = `REF${Date.now().toString(36).toUpperCase()}`;
        const newProfile = await base44.entities.CustomerProfile.create({
          user_email: userData.email,
          display_name: userData.full_name,
          referral_code: code,
          total_points: 0,
          trusted_businesses: []
        });
        setProfile(newProfile);
      } else {
        setProfile(profiles[0]);
      }
    };
    init();
  }, []);
  
  const { data: trustedBusinesses = [], isLoading: loadingTrusted } = useQuery({
    queryKey: ['trusted-businesses', profile?.trusted_businesses],
    queryFn: async () => {
      if (!profile?.trusted_businesses?.length) return [];
      const all = await base44.entities.Business.list();
      return all.filter(b => profile.trusted_businesses.includes(b.id));
    },
    enabled: !!profile
  });
  
  const { data: myReferrals = [] } = useQuery({
    queryKey: ['my-referrals', profile?.user_email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: profile.user_email }, '-created_date', 20),
    enabled: !!profile
  });
  
  const { data: myHires = [] } = useQuery({
    queryKey: ['my-hires', profile?.user_email],
    queryFn: () => base44.entities.Hire.filter({ customer_email: profile.user_email }, '-created_date', 10),
    enabled: !!profile
  });
  
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => base44.entities.CustomerProfile.list('-total_points', 10)
  });
  
  const handleShareBusiness = (business) => {
    setSelectedBusiness(business);
    setShowShareModal(true);
  };
  
  const handleRemoveTrusted = async (businessId) => {
    if (!profile) return;
    
    const newTrusted = profile.trusted_businesses.filter(id => id !== businessId);
    await base44.entities.CustomerProfile.update(profile.id, {
      trusted_businesses: newTrusted
    });
    
    setProfile(prev => ({ ...prev, trusted_businesses: newTrusted }));
    queryClient.invalidateQueries({ queryKey: ['trusted-businesses'] });
    toast.success('Removed from trusted list');
  };
  
  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  
  const successfulReferrals = myReferrals.filter(r => r.status === 'rewarded').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {profile.display_name || user.full_name}!
              </h1>
              <p className="text-indigo-100 mt-1">
                Your referral code: <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">{profile.referral_code}</span>
              </p>
            </div>
            <Link to={createPageUrl('BrowseServices')}>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                <Plus className="w-4 h-4 mr-2" />
                Find Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Points', value: profile.total_points || 0, icon: Sparkles, color: 'text-yellow-500' },
            { label: 'Trusted Providers', value: profile.trusted_businesses?.length || 0, icon: Heart, color: 'text-red-500' },
            { label: 'Referrals Made', value: myReferrals.length, icon: Share2, color: 'text-indigo-500' },
            { label: 'Successful', value: successfulReferrals, icon: Trophy, color: 'text-green-500' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="trusted" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="trusted">My Trusted List</TabsTrigger>
                <TabsTrigger value="referrals">My Referrals</TabsTrigger>
                <TabsTrigger value="hires">My Hires</TabsTrigger>
              </TabsList>
              
              <TabsContent value="trusted">
                {loadingTrusted ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : trustedBusinesses.length === 0 ? (
                  <Card className="py-12">
                    <CardContent className="text-center">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No trusted providers yet</h3>
                      <p className="text-gray-500 mb-4">Start adding businesses to your trusted list</p>
                      <Link to={createPageUrl('BrowseServices')}>
                        <Button>Browse Services</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {trustedBusinesses.map(business => (
                      <Card key={business.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              {business.logo_url ? (
                                <img src={business.logo_url} alt="" className="w-full h-full rounded-xl object-cover" />
                              ) : (
                                <span className="text-white font-bold text-xl">{business.company_name?.charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{business.company_name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                {business.average_rating?.toFixed(1) || '0.0'}
                                <span className="mx-1">•</span>
                                {business.total_customers || 0} customers
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => handleShareBusiness(business)}
                              >
                                <Share2 className="w-4 h-4 mr-1" />
                                Refer
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleRemoveTrusted(business.id)}
                              >
                                <Heart className="w-4 h-4 fill-current" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="referrals">
                {myReferrals.length === 0 ? (
                  <Card className="py-12">
                    <CardContent className="text-center">
                      <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No referrals yet</h3>
                      <p className="text-gray-500">Share your trusted providers and earn {POINTS_PER_REFERRAL} points per referral!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {myReferrals.map(referral => (
                      <Card key={referral.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">Referral to {referral.referred_email || 'Pending signup'}</p>
                            <p className="text-sm text-gray-500">Via {referral.share_method || 'link'}</p>
                          </div>
                          <Badge variant={
                            referral.status === 'rewarded' ? 'default' :
                            referral.status === 'hired' ? 'secondary' : 'outline'
                          }>
                            {referral.status === 'rewarded' && `+${referral.points_awarded} pts`}
                            {referral.status === 'hired' && 'Hired'}
                            {referral.status === 'signed_up' && 'Signed Up'}
                            {referral.status === 'pending' && 'Pending'}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="hires">
                {myHires.length === 0 ? (
                  <Card className="py-12">
                    <CardContent className="text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No service history</h3>
                      <p className="text-gray-500">Your hired services will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {myHires.map(hire => (
                      <Card key={hire.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{hire.service_category}</p>
                            <p className="text-sm text-gray-500">{hire.hire_date}</p>
                          </div>
                          <Badge variant={
                            hire.status === 'completed' ? 'default' :
                            hire.status === 'confirmed' ? 'secondary' : 'outline'
                          }>
                            {hire.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Points Card */}
            <PointsDisplay points={profile.total_points || 0} />
            
            {/* Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-indigo-600" />
                  Available Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {REWARD_TIERS.map(tier => {
                  const canRedeem = (profile.total_points || 0) >= tier.points;
                  return (
                    <div 
                      key={tier.points}
                      className={`p-3 rounded-lg border ${canRedeem ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{tier.name}</p>
                          <p className="text-sm text-gray-500">{tier.points} points</p>
                        </div>
                        {canRedeem ? (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Redeem
                          </Button>
                        ) : (
                          <Badge variant="outline">{tier.points - (profile.total_points || 0)} pts away</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Referrers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                        idx === 2 ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {p.display_name || 'Anonymous'}
                          {p.user_email === profile.user_email && ' (You)'}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-indigo-600">{p.total_points || 0}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      <ReferralShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        business={selectedBusiness}
        referralCode={profile.referral_code}
        onShareTracked={async (method) => {
          // Create referral record
          await base44.entities.Referral.create({
            referrer_email: profile.user_email,
            business_id: selectedBusiness?.id,
            referral_code: profile.referral_code,
            share_method: method,
            status: 'pending'
          });
          queryClient.invalidateQueries({ queryKey: ['my-referrals'] });
        }}
      />
    </div>
  );
}