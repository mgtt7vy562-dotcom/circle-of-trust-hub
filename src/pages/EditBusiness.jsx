import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Trash2
} from 'lucide-react';
import SERVICE_CATEGORIES from '@/components/shared/ServiceCategories';
import { toast } from 'sonner';

export default function EditBusiness() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    phone: '',
    website: '',
    google_reviews_link: '',
    bio: '',
    logo_url: '',
    categories: [],
    location: {
      city: '',
      state: '',
      zip: ''
    }
  });
  
  useEffect(() => {
    const init = async () => {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) {
        base44.auth.redirectToLogin(createPageUrl('EditBusiness'));
        return;
      }
      
      const userData = await base44.auth.me();
      setUser(userData);
      
      const businesses = await base44.entities.Business.filter({ owner_email: userData.email });
      if (businesses.length === 0) {
        window.location.href = createPageUrl('BusinessOnboarding');
        return;
      }
      
      const biz = businesses[0];
      setBusiness(biz);
      setFormData({
        company_name: biz.company_name || '',
        phone: biz.phone || '',
        website: biz.website || '',
        google_reviews_link: biz.google_reviews_link || '',
        bio: biz.bio || '',
        logo_url: biz.logo_url || '',
        categories: biz.categories || [],
        location: biz.location || { city: '', state: '', zip: '' }
      });
      setLoading(false);
    };
    init();
  }, []);
  
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, logo_url: file_url }));
    setUploadingLogo(false);
  };
  
  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };
  
  const handleSave = async () => {
    if (formData.categories.length === 0) {
      toast.error('Please select at least one service category');
      return;
    }
    
    setSaving(true);
    
    await base44.entities.Business.update(business.id, formData);
    
    toast.success('Changes saved!');
    setSaving(false);
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('BusinessDashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Business Profile</h1>
            <p className="text-gray-500">Update your business information</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Logo & Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300">
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">Business Logo</p>
                  <p className="text-sm text-gray-500">Click to upload a new logo</p>
                  {formData.logo_url && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 mt-1 -ml-3"
                      onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid gap-4">
                <div>
                  <Label>Business Name *</Label>
                  <Input 
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input 
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Google Business Profile Link</Label>
                  <Input 
                    value={formData.google_reviews_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, google_reviews_link: e.target.value }))}
                    className="mt-1"
                    placeholder="Link to your Google reviews"
                  />
                </div>
                
                <div>
                  <Label>Bio (max 200 words)</Label>
                  <Textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Service Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>Select all services you offer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_CATEGORIES.map(category => {
                  const Icon = category.icon;
                  const isSelected = formData.categories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-sm">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label>City</Label>
                  <Input 
                    value={formData.location.city}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, city: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>State</Label>
                    <Input 
                      value={formData.location.state}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, state: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>ZIP Code</Label>
                    <Input 
                      value={formData.location.zip}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, zip: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Link to={createPageUrl('BusinessDashboard')}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}