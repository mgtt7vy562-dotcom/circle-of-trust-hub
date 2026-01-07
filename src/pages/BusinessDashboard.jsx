import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users, 
  Star, 
  Share2, 
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Settings,
  Loader2,
  Plus,
  Send,
  MessageSquare,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { TrustBadge, calculateTrustRank } from '@/components/shared/TrustBadge';
import { RatingStars } from '@/components/shared/RatingStars';
import { toast } from 'sonner';

export default function BusinessDashboard() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoMessage, setPromoMessage] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const init = async () => {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) {
        base44.auth.redirectToLogin(createPageUrl('BusinessDashboard'));
        return;
      }
      
      const userData = await base44.auth.me();
      setUser(userData);
      
      const businesses = await base44.entities.Business.filter({ owner_email: userData.email });
      if (businesses.length === 0) {
        window.location.href = createPageUrl('BusinessOnboarding');
        return;
      }
      
      setBusiness(businesses[0]);
      setLoading(false);
    };
    init();
  }, []);
  
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['business-customers', business?.id],
    queryFn: () => base44.entities.Hire.filter({ business_id: business.id }, '-created_date', 100),
    enabled: !!business
  });
  
  const { data: reviews = [] } = useQuery({
    queryKey: ['business-reviews', business?.id],
    queryFn: () => base44.entities.Review.filter({ business_id: business.id }, '-created_date', 50),
    enabled: !!business
  });
  
  const { data: referrals = [] } = useQuery({
    queryKey: ['business-referrals', business?.id],
    queryFn: () => base44.entities.Referral.filter({ business_id: business.id }, '-created_date', 50),
    enabled: !!business
  });
  
  const updateHireStatus = async (hireId, newStatus) => {
    await base44.entities.Hire.update(hireId, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['business-customers'] });
    
    // Update trust score if completed
    if (newStatus === 'completed' && business) {
      const newScore = (business.trust_score || 0) + 10;
      const newRank = calculateTrustRank(newScore);
      await base44.entities.Business.update(business.id, {
        trust_score: newScore,
        trust_rank: newRank,
        total_customers: (business.total_customers || 0) + 1
      });
      setBusiness(prev => ({ ...prev, trust_score: newScore, trust_rank: newRank }));
    }
    
    toast.success('Status updated!');
  };
  
  const sendPromo = async () => {
    if (!promoMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    // In production, this would send emails/SMS
    toast.success(`Promo sent to ${selectedCustomers.length} customers!`);
    setPromoMessage('');
    setSelectedCustomers([]);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  
  const pendingRequests = customers.filter(c => c.status === 'pending');
  const completedJobs = customers.filter(c => c.status === 'completed');
  
  const stats = [
    { label: 'Total Customers', value: completedJobs.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Avg Rating', value: business.average_rating?.toFixed(1) || '0.0', icon: Star, color: 'bg-yellow-500' },
    { label: 'Referrals', value: referrals.length, icon: Share2, color: 'bg-green-500' },
    { label: 'Trust Score', value: business.trust_score || 0, icon: TrendingUp, color: 'bg-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                {business.logo_url ? (
                  <img src={business.logo_url} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <span className="text-white font-bold text-2xl">{business.company_name?.charAt(0)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{business.company_name}</h1>
                  <TrustBadge rank={business.trust_rank} size="sm" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={business.average_rating || 0} size="sm" />
                  <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl(`BusinessProfile?id=${business.id}`)}>
                <Button variant="outline">View Public Profile</Button>
              </Link>
              <Link to={createPageUrl('EditBusiness')}>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Pending Requests Alert */}
        {pendingRequests.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  You have {pendingRequests.length} pending quote request{pendingRequests.length > 1 ? 's' : ''}
                </span>
              </div>
              <Button size="sm" variant="outline" className="border-yellow-400 text-yellow-700">
                View All
              </Button>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customer History</CardTitle>
                <Badge variant="secondary">{customers.length} total</Badge>
              </CardHeader>
              <CardContent>
                {loadingCustomers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : customers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No customers yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Service</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map(customer => (
                          <tr key={customer.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium">{customer.customer_name || 'Customer'}</p>
                                <p className="text-sm text-gray-500">{customer.customer_email}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline">{customer.service_category}</Badge>
                            </td>
                            <td className="py-4 px-4 text-gray-500">
                              {customer.hire_date ? format(new Date(customer.hire_date), 'MMM d, yyyy') : '-'}
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant={
                                customer.status === 'completed' ? 'default' :
                                customer.status === 'confirmed' ? 'secondary' :
                                customer.status === 'cancelled' ? 'destructive' : 'outline'
                              }>
                                {customer.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex gap-2">
                                {customer.status === 'pending' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateHireStatus(customer.id, 'confirmed')}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Accept
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="text-red-500"
                                      onClick={() => updateHireStatus(customer.id, 'cancelled')}
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                {customer.status === 'confirmed' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => updateHireStatus(customer.id, 'completed')}
                                  >
                                    Mark Complete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="p-4 border rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="font-medium text-indigo-600">
                                {review.customer_name?.charAt(0) || 'C'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{review.customer_name || 'Customer'}</p>
                              <p className="text-sm text-gray-500">
                                {format(new Date(review.created_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <RatingStars rating={review.rating} size="sm" />
                        </div>
                        <p className="text-gray-600">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Referral Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-12">
                    <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No referrals yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Customers will earn points for referring others to your business
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referrals.map(referral => (
                      <div key={referral.id} className="p-4 border rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-medium">Referred by: {referral.referrer_email}</p>
                          <p className="text-sm text-gray-500">
                            {referral.referred_email ? `To: ${referral.referred_email}` : 'Pending signup'}
                          </p>
                        </div>
                        <Badge variant={
                          referral.status === 'rewarded' ? 'default' :
                          referral.status === 'hired' ? 'secondary' : 'outline'
                        }>
                          {referral.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="marketing">
            <Card>
              <CardHeader>
                <CardTitle>Send Promo to Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Select customers to send a promotional message
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {completedJobs.slice(0, 10).map(customer => (
                        <Badge 
                          key={customer.id}
                          variant={selectedCustomers.includes(customer.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedCustomers(prev => 
                              prev.includes(customer.id)
                                ? prev.filter(id => id !== customer.id)
                                : [...prev, customer.id]
                            );
                          }}
                        >
                          {customer.customer_name || customer.customer_email}
                        </Badge>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedCustomers(completedJobs.map(c => c.id))}
                      >
                        Select All
                      </Button>
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="Write your promotional message..."
                    value={promoMessage}
                    onChange={(e) => setPromoMessage(e.target.value)}
                    rows={4}
                  />
                  
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={sendPromo}
                    disabled={selectedCustomers.length === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send to {selectedCustomers.length} Customer{selectedCustomers.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}