import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Users, 
  Calendar,
  Share2,
  Heart,
  ExternalLink,
  Star,
  ChevronRight,
  ArrowLeft,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { TrustBadge } from '@/components/shared/TrustBadge';
import { RatingStars } from '@/components/shared/RatingStars';
import { CategoryIcon, getCategoryById } from '@/components/shared/ServiceCategories';
import { ReferralShareModal } from '@/components/referral/ReferralShareModal';
import { toast } from 'sonner';

export default function BusinessProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const businessId = urlParams.get('id');
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState('');
  const [customerProfile, setCustomerProfile] = useState(null);
  const [isTrusted, setIsTrusted] = useState(false);
  
  const { data: business, isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      const businesses = await base44.entities.Business.filter({ id: businessId });
      return businesses[0];
    },
    enabled: !!businessId
  });
  
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', businessId],
    queryFn: () => base44.entities.Review.filter({ business_id: businessId }, '-created_date', 10),
    enabled: !!businessId
  });
  
  useEffect(() => {
    const loadProfile = async () => {
      const isAuthed = await base44.auth.isAuthenticated();
      if (isAuthed) {
        const user = await base44.auth.me();
        const profiles = await base44.entities.CustomerProfile.filter({ user_email: user.email });
        if (profiles.length > 0) {
          setCustomerProfile(profiles[0]);
          setIsTrusted(profiles[0].trusted_businesses?.includes(businessId));
        }
      }
    };
    loadProfile();
  }, [businessId]);
  
  const handleToggleTrusted = async () => {
    if (!customerProfile) {
      toast.error('Please sign up as a customer first');
      return;
    }
    
    const newTrusted = isTrusted 
      ? customerProfile.trusted_businesses.filter(id => id !== businessId)
      : [...(customerProfile.trusted_businesses || []), businessId];
    
    await base44.entities.CustomerProfile.update(customerProfile.id, {
      trusted_businesses: newTrusted
    });
    
    setIsTrusted(!isTrusted);
    toast.success(isTrusted ? 'Removed from trusted list' : 'Added to trusted list!');
  };
  
  const handleRequestQuote = async () => {
    if (!customerProfile) {
      toast.error('Please sign up to request a quote');
      return;
    }
    
    // Create a hire request
    await base44.entities.Hire.create({
      business_id: businessId,
      customer_email: customerProfile.user_email,
      customer_name: customerProfile.display_name,
      service_category: business.categories?.[0] || 'general',
      notes: quoteMessage,
      status: 'pending'
    });
    
    toast.success('Quote request sent!');
    setShowQuoteForm(false);
    setQuoteMessage('');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  
  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Business not found</h2>
          <Link to={createPageUrl('BrowseServices')}>
            <Button>Browse Services</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-4 left-4">
          <Link to={createPageUrl('BrowseServices')}>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-12">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-6">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="w-32 h-32 rounded-2xl bg-white shadow-lg overflow-hidden border-4 border-white flex-shrink-0">
                {business.logo_url ? (
                  <img src={business.logo_url} alt={business.company_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <span className="text-white font-bold text-4xl">
                      {business.company_name?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {business.company_name}
                      </h1>
                      <TrustBadge rank={business.trust_rank} />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <RatingStars rating={business.average_rating || 0} size="lg" />
                      <span className="text-gray-500">({business.total_reviews || 0} reviews)</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {business.categories?.map(catId => {
                        const cat = getCategoryById(catId);
                        return cat ? (
                          <Badge key={catId} className={`${cat.color} text-white`}>
                            {cat.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={isTrusted ? "secondary" : "outline"}
                      onClick={handleToggleTrusted}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isTrusted ? 'fill-current text-red-500' : ''}`} />
                      {isTrusted ? 'Trusted' : 'Add to Trust List'}
                    </Button>
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Refer & Earn
                    </Button>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{business.total_customers || 0} customers served</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Share2 className="w-4 h-4" />
                    <span>{business.total_referrals || 0} referrals</span>
                  </div>
                  {business.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{business.location.city}, {business.location.state}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-line">
                  {business.bio || 'No description provided.'}
                </p>
              </CardContent>
            </Card>
            
            {/* Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customer Reviews</CardTitle>
                <Badge variant="secondary">{reviews.length} reviews</Badge>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {review.customer_name?.charAt(0) || 'C'}
                              </span>
                            </div>
                            <span className="font-medium">{review.customer_name || 'Customer'}</span>
                          </div>
                          <RatingStars rating={review.rating} size="sm" showValue={false} />
                        </div>
                        <p className="text-gray-600 text-sm">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-indigo-600">
                    <Phone className="w-5 h-5" />
                    {business.phone}
                  </a>
                )}
                {business.owner_email && (
                  <a href={`mailto:${business.owner_email}`} className="flex items-center gap-3 text-gray-600 hover:text-indigo-600">
                    <Mail className="w-5 h-5" />
                    {business.owner_email}
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-indigo-600">
                    <Globe className="w-5 h-5" />
                    Website
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {business.google_reviews_link && (
                  <a href={business.google_reviews_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-indigo-600">
                    <Star className="w-5 h-5" />
                    Google Reviews
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </CardContent>
            </Card>
            
            {/* Request Quote */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Request a Quote
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showQuoteForm ? (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Describe what service you need..."
                      value={quoteMessage}
                      onChange={(e) => setQuoteMessage(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleRequestQuote}
                      >
                        Send Request
                      </Button>
                      <Button variant="outline" onClick={() => setShowQuoteForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setShowQuoteForm(true)}
                  >
                    Get Free Quote
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      <ReferralShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        business={business}
        referralCode={customerProfile?.referral_code || 'GUEST'}
        onShareTracked={(method) => {
          // Track share
        }}
      />
    </div>
  );
}