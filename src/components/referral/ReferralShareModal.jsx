import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Share2, 
  Copy, 
  Check, 
  Mail, 
  MessageCircle,
  Facebook,
  Twitter,
  Link2
} from 'lucide-react';
import { toast } from 'sonner';

export const ReferralShareModal = ({ 
  isOpen, 
  onClose, 
  business, 
  referralCode,
  onShareTracked
}) => {
  const [copied, setCopied] = useState(false);
  
  const referralLink = `${window.location.origin}/refer/${referralCode}?business=${business?.id}`;
  const shareText = `Check out ${business?.company_name}! I've used their services and highly recommend them. Use my link to sign up: ${referralLink}`;
  
  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    onShareTracked?.('link');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareVia = (platform) => {
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        url = `mailto:?subject=Check out ${business?.company_name}&body=${encodeURIComponent(shareText)}`;
        break;
      case 'sms':
        url = `sms:?body=${encodeURIComponent(shareText)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank');
      onShareTracked?.(platform);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            Share & Earn Points
          </DialogTitle>
          <DialogDescription>
            Share {business?.company_name} with friends and earn 25 points for each successful referral!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Business Preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              {business?.logo_url ? (
                <img src={business.logo_url} alt="" className="w-full h-full rounded-lg object-cover" />
              ) : (
                <span className="text-white font-bold text-lg">{business?.company_name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{business?.company_name}</p>
              <p className="text-sm text-gray-500">Your referral code: <span className="font-mono font-bold text-indigo-600">{referralCode}</span></p>
            </div>
          </div>
          
          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your unique referral link</label>
            <div className="flex gap-2">
              <Input 
                value={referralLink} 
                readOnly 
                className="font-mono text-sm bg-gray-50"
              />
              <Button 
                onClick={copyLink}
                variant={copied ? "secondary" : "default"}
                className={copied ? "bg-green-100 text-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Share Buttons */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Share via</label>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => shareVia('facebook')}
                className="flex items-center gap-2 h-12 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
              >
                <Facebook className="w-5 h-5" />
                Facebook
              </Button>
              <Button 
                variant="outline" 
                onClick={() => shareVia('twitter')}
                className="flex items-center gap-2 h-12 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600"
              >
                <Twitter className="w-5 h-5" />
                Twitter/X
              </Button>
              <Button 
                variant="outline" 
                onClick={() => shareVia('email')}
                className="flex items-center gap-2 h-12 hover:bg-gray-100"
              >
                <Mail className="w-5 h-5" />
                Email
              </Button>
              <Button 
                variant="outline" 
                onClick={() => shareVia('sms')}
                className="flex items-center gap-2 h-12 hover:bg-green-50 hover:border-green-200 hover:text-green-600"
              >
                <MessageCircle className="w-5 h-5" />
                SMS
              </Button>
            </div>
          </div>
          
          {/* Points Info */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">🎁</span>
              </div>
              <div>
                <p className="font-semibold text-yellow-800">Earn 25 Points</p>
                <p className="text-sm text-yellow-700">
                  When your friend signs up and hires {business?.company_name}, you'll earn points redeemable for gift cards!
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralShareModal;