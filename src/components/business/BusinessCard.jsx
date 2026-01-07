import React from 'react';
import { MapPin, Phone, Globe, Users, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '../shared/TrustBadge';
import { RatingStars } from '../shared/RatingStars';
import { CategoryIcon, getCategoryById } from '../shared/ServiceCategories';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export const BusinessCard = ({ 
  business, 
  onAddTrusted,
  onRemoveTrusted,
  isTrusted = false,
  showActions = true,
  compact = false
}) => {
  if (!business) return null;
  
  const primaryCategory = business.categories?.[0];
  
  if (compact) {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
              {business.logo_url ? (
                <img src={business.logo_url} alt={business.company_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <span className="text-white font-bold text-lg">
                    {business.company_name?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{business.company_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <RatingStars rating={business.average_rating || 0} size="sm" />
                <span className="text-xs text-gray-500">({business.total_reviews || 0})</span>
              </div>
            </div>
            <TrustBadge rank={business.trust_rank} size="sm" showLabel={false} />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        {business.logo_url && (
          <img 
            src={business.logo_url} 
            alt={business.company_name}
            className="w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div className="w-16 h-16 rounded-xl bg-white shadow-lg overflow-hidden border-2 border-white">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.company_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="text-white font-bold text-2xl">
                  {business.company_name?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <TrustBadge rank={business.trust_rank} size="sm" />
        </div>
      </div>
      
      <CardContent className="p-4 pt-3">
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
            {business.company_name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={business.average_rating || 0} size="sm" />
            <span className="text-sm text-gray-500">({business.total_reviews || 0} reviews)</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {business.categories?.slice(0, 3).map(catId => {
            const cat = getCategoryById(catId);
            return cat ? (
              <Badge key={catId} variant="secondary" className="text-xs">
                {cat.name}
              </Badge>
            ) : null;
          })}
          {business.categories?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{business.categories.length - 3}
            </Badge>
          )}
        </div>
        
        {business.location && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{business.location.city}, {business.location.state}</span>
          </div>
        )}
        
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{business.total_customers || 0} customers</span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            <Link to={createPageUrl(`BusinessProfile?id=${business.id}`)} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Profile
              </Button>
            </Link>
            {isTrusted ? (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => onRemoveTrusted?.(business.id)}
              >
                Trusted ✓
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => onAddTrusted?.(business.id)}
              >
                Add Trust
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessCard;