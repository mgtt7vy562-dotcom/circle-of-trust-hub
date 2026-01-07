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
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Upload, 
  MapPin, 
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Globe,
  Phone,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SERVICE_CATEGORIES from '@/components/shared/ServiceCategories';
import { toast } from 'sonner';

export default function BusinessOnboarding() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        base44.auth.redirectToLogin(createPageUrl('BusinessOnboarding'));
        return;
      }
      
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Check if already has a business
      const businesses = await base44.entities.Business.filter({ owner_email: userData.email });
      if (businesses.length > 0) {
        window.location.href = createPageUrl('BusinessDashboard');
        return;
      }
      
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
  
  const handleSubmit = async () => {
    if (formData.categories.length === 0) {
      toast.error('Please select at least one service category');
      return;
    }
    
    if (!formData.company_name.trim()) {
      toast.error('Please enter your business name');
      return;
    }
    
    setSubmitting(true);
    
    await base44.entities.Business.create({
      ...formData,
      owner_email: user.email,
      trust_rank: 'bronze',
      trust_score: 0,
      total_customers: 0,
      total_referrals: 0,
      is_verified: false
    });
    
    // Update user type
    await base44.auth.updateMe({ user_type: 'business' });
    
    toast.success('Business profile created!');
    window.location.href = createPageUrl('BusinessDashboard');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <AnimatePresence mode="wait">
          {/* Step 1: Categories */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-2xl">What services do you offer?</CardTitle>
                  <CardDescription>Select all categories that apply to your business</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {SERVICE_CATEGORIES.map(category => {
                      const Icon = category.icon;
                      const isSelected = formData.categories.includes(category.id);
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryToggle(category.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                            isSelected 
                              ? 'border-indigo-600 bg-indigo-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-sm">{category.name}</span>
                          {isSelected && (
                            <Check className="w-5 h-5 text-indigo-600 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  <Button 
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setStep(2)}
                    disabled={formData.categories.length === 0}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Step 2: Business Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">Tell us about your business</CardTitle>
                  <CardDescription>This information will appear on your public profile</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Logo Upload */}
                  <div className="flex flex-col items-center">
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
                    <p className="text-sm text-gray-500 mt-2">Upload your logo</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Business Name *</Label>
                      <Input 
                        placeholder="Your Business Name"
                        value={formData.company_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                        className="mt-1 h-12"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Phone</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input 
                            placeholder="(555) 000-0000"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="pl-10 h-12"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Website</Label>
                        <div className="relative mt-1">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input 
                            placeholder="www.example.com"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                            className="pl-10 h-12"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Google Business Profile Link</Label>
                      <Input 
                        placeholder="Link to your Google reviews"
                        value={formData.google_reviews_link}
                        onChange={(e) => setFormData(prev => ({ ...prev, google_reviews_link: e.target.value }))}
                        className="mt-1 h-12"
                      />
                    </div>
                    
                    <div>
                      <Label>Bio (max 200 words)</Label>
                      <Textarea 
                        placeholder="Tell customers about your business, experience, and what makes you stand out..."
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        className="mt-1 h-32"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="h-12">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => setStep(3)}
                      disabled={!formData.company_name.trim()}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Step 3: Location */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-2xl">Where are you located?</CardTitle>
                  <CardDescription>Help customers find you in their area</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>City</Label>
                      <Input 
                        placeholder="City"
                        value={formData.location.city}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, city: e.target.value }
                        }))}
                        className="mt-1 h-12"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>State</Label>
                        <Input 
                          placeholder="State"
                          value={formData.location.state}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, state: e.target.value }
                          }))}
                          className="mt-1 h-12"
                        />
                      </div>
                      <div>
                        <Label>ZIP Code</Label>
                        <Input 
                          placeholder="12345"
                          value={formData.location.zip}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, zip: e.target.value }
                          }))}
                          className="mt-1 h-12"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="h-12">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Create My Profile
                          <Check className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}