import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Shield, 
  Menu,
  X,
  User,
  LogOut,
  Building2,
  Search,
  Gift,
  Home,
  LayoutDashboard
} from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthed = await base44.auth.isAuthenticated();
      if (isAuthed) {
        const userData = await base44.auth.me();
        setUser(userData);
        setUserType(userData.user_type);
      }
    };
    checkAuth();
  }, []);
  
  // Pages that should not show the header
  const noHeaderPages = ['Home'];
  const showHeader = !noHeaderPages.includes(currentPageName);
  
  if (!showHeader) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">TrustLink</span>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to={createPageUrl('BrowseServices')} 
                className="text-gray-600 hover:text-indigo-600 flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Browse Services
              </Link>
              
              {user && userType === 'business' && (
                <Link 
                  to={createPageUrl('BusinessDashboard')} 
                  className="text-gray-600 hover:text-indigo-600 flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" />
                  My Business
                </Link>
              )}
              
              {user && userType !== 'business' && (
                <>
                  <Link 
                    to={createPageUrl('CustomerDashboard')} 
                    className="text-gray-600 hover:text-indigo-600 flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link 
                    to={createPageUrl('Rewards')} 
                    className="text-gray-600 hover:text-indigo-600 flex items-center gap-1.5"
                  >
                    <Gift className="w-4 h-4" />
                    Rewards
                  </Link>
                </>
              )}
            </nav>
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="hidden sm:inline">{user.full_name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {userType === 'business' ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('BusinessDashboard')} className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('EditBusiness')} className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Edit Profile
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('CustomerDashboard')} className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('Rewards')} className="flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            Rewards
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => base44.auth.logout()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost"
                    onClick={() => base44.auth.redirectToLogin()}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => base44.auth.redirectToLogin(createPageUrl('CustomerDashboard'))}
                  >
                    Get Started
                  </Button>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-2">
              <Link 
                to={createPageUrl('BrowseServices')}
                className="block px-4 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Services
              </Link>
              {user && (
                <>
                  <Link 
                    to={createPageUrl(userType === 'business' ? 'BusinessDashboard' : 'CustomerDashboard')}
                    className="block px-4 py-2 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {userType !== 'business' && (
                    <Link 
                      to={createPageUrl('Rewards')}
                      className="block px-4 py-2 rounded-lg hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Rewards
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}