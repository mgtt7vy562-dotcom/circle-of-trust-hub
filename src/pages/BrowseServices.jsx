import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  MapPin, 
  SlidersHorizontal,
  X,
  Loader2
} from 'lucide-react';
import SERVICE_CATEGORIES, { getCategoryById } from '@/components/shared/ServiceCategories';
import BusinessCard from '@/components/business/BusinessCard';
import { toast } from 'sonner';

export default function BrowseServices() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';
  const initialSearch = urlParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('trust_score');
  const [showFilters, setShowFilters] = useState(false);
  const [trustedIds, setTrustedIds] = useState([]);
  const [customerProfile, setCustomerProfile] = useState(null);
  
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const loadProfile = async () => {
      const isAuthed = await base44.auth.isAuthenticated();
      if (isAuthed) {
        const user = await base44.auth.me();
        const profiles = await base44.entities.CustomerProfile.filter({ user_email: user.email });
        if (profiles.length > 0) {
          setCustomerProfile(profiles[0]);
          setTrustedIds(profiles[0].trusted_businesses || []);
        }
      }
    };
    loadProfile();
  }, []);
  
  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['businesses', selectedCategory, sortBy],
    queryFn: async () => {
      const sortField = sortBy === 'trust_score' ? '-trust_score' : 
                       sortBy === 'rating' ? '-average_rating' : '-total_customers';
      
      if (selectedCategory === 'all') {
        return base44.entities.Business.list(sortField, 50);
      }
      
      const all = await base44.entities.Business.list(sortField, 100);
      return all.filter(b => b.categories?.includes(selectedCategory));
    }
  });
  
  const filteredBusinesses = businesses.filter(b => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      b.company_name?.toLowerCase().includes(query) ||
      b.bio?.toLowerCase().includes(query) ||
      b.location?.city?.toLowerCase().includes(query)
    );
  });
  
  const handleAddTrusted = async (businessId) => {
    if (!customerProfile) {
      toast.error('Please sign up as a customer first');
      return;
    }
    
    const newTrusted = [...trustedIds, businessId];
    setTrustedIds(newTrusted);
    
    await base44.entities.CustomerProfile.update(customerProfile.id, {
      trusted_businesses: newTrusted
    });
    
    toast.success('Added to your trusted list!');
  };
  
  const handleRemoveTrusted = async (businessId) => {
    if (!customerProfile) return;
    
    const newTrusted = trustedIds.filter(id => id !== businessId);
    setTrustedIds(newTrusted);
    
    await base44.entities.CustomerProfile.update(customerProfile.id, {
      trusted_businesses: newTrusted
    });
    
    toast.success('Removed from trusted list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Search businesses, services, locations..."
                className="pl-12 h-12 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 h-12">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {SERVICE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trust_score">Trust Rank</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="customers">Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Active Filters */}
          {(selectedCategory !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getCategoryById(selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${filteredBusinesses.length} businesses found`}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <Card className="py-20">
            <CardContent className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No businesses found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map(business => (
              <BusinessCard 
                key={business.id}
                business={business}
                isTrusted={trustedIds.includes(business.id)}
                onAddTrusted={handleAddTrusted}
                onRemoveTrusted={handleRemoveTrusted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}