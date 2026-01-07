import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ArrowRight, 
  Users, 
  Gift, 
  Shield, 
  Star,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import SERVICE_CATEGORIES, { CategoryIcon } from '@/components/shared/ServiceCategories';
import BusinessCard from '@/components/business/BusinessCard';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthenticated(authed);
      if (authed) {
        const user = await base44.auth.me();
        setUserType(user.user_type);
      }
    };
    checkAuth();
  }, []);
  
  const { data: featuredBusinesses = [] } = useQuery({
    queryKey: ['featured-businesses'],
    queryFn: () => base44.entities.Business.filter({ is_verified: true }, '-trust_score', 6)
  });
  
  const stats = [
    { label: 'Active Businesses', value: '500+', icon: Users },
    { label: 'Happy Customers', value: '10K+', icon: Star },
    { label: 'Rewards Given', value: '$25K+', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="bg-white/20 text-white border-0 mb-6 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 10,000+ customers
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Find Trusted Services.
              <span className="block text-yellow-300">Earn Rewards.</span>
            </h1>
            
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
              Connect with verified local service providers recommended by people you trust. 
              Share your favorites and earn points for every referral.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="flex gap-3 p-2 bg-white rounded-2xl shadow-2xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    placeholder="Search services (e.g., lawn care, cleaning...)"
                    className="pl-12 h-14 border-0 text-lg text-gray-900 focus-visible:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Link to={createPageUrl(`BrowseServices${searchQuery ? `?search=${searchQuery}` : ''}`)}>
                  <Button size="lg" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                    Search
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Button 
                    size="lg" 
                    className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 text-lg rounded-xl"
                    onClick={() => base44.auth.redirectToLogin(createPageUrl('CustomerDashboard'))}
                  >
                    I'm a Customer
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg rounded-xl"
                    onClick={() => base44.auth.redirectToLogin(createPageUrl('BusinessOnboarding'))}
                  >
                    I'm a Business Owner
                  </Button>
                </>
              ) : (
                <Link to={createPageUrl(userType === 'business' ? 'BusinessDashboard' : 'CustomerDashboard')}>
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 text-lg rounded-xl">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 md:p-6 text-center">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from 10 essential service categories, all verified and reviewed by real customers.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {SERVICE_CATEGORIES.map((category, idx) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link to={createPageUrl(`BrowseServices?category=${category.id}`)}>
                    <Card className="group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
                      <CardContent className="p-6 text-center">
                        <div className={`w-14 h-14 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <p className="font-medium text-gray-900 text-sm">{category.name}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      {featuredBusinesses.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Top Rated Providers</h2>
                <p className="text-gray-600 mt-2">Discover highly-trusted businesses in your area</p>
              </div>
              <Link to={createPageUrl('BrowseServices')}>
                <Button variant="ghost" className="text-indigo-600">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBusinesses.map((business) => (
                <BusinessCard 
                  key={business.id} 
                  business={business}
                  showActions={false}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How TrustLink Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple, rewarding, and built on trust
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Find Trusted Services',
                description: 'Browse verified providers in your area, filtered by ratings, reviews, and trust rank.',
                icon: Search
              },
              {
                step: '2',
                title: 'Share Your Favorites',
                description: 'Recommend great businesses to friends and family with your unique referral link.',
                icon: Users
              },
              {
                step: '3',
                title: 'Earn Rewards',
                description: 'Get 25 points for each successful referral. Redeem for gift cards and prizes!',
                icon: Gift
              }
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="relative overflow-hidden border-0 shadow-lg h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-bl-full" />
                  <CardContent className="p-8 relative">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-xl">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of happy customers and trusted businesses on TrustLink
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 text-lg rounded-xl"
              onClick={() => base44.auth.redirectToLogin(createPageUrl('CustomerDashboard'))}
            >
              Sign Up as Customer
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 h-14 px-8 text-lg rounded-xl"
              onClick={() => base44.auth.redirectToLogin(createPageUrl('BusinessOnboarding'))}
            >
              Register Your Business
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-indigo-400" />
              <span className="text-2xl font-bold text-white">TrustLink</span>
            </div>
            <p className="text-sm">© 2024 TrustLink Customers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}