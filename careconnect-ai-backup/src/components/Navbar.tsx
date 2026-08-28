import React, { useState } from 'react';
import { 
  HeartPulse, 
  Search, 
  Bot, 
  Flower2, 
  Calendar, 
  History, 
  User, 
  AlertTriangle, 
  PhoneCall, 
  Menu, 
  X, 
  ShieldCheck,
  ChevronDown,
  Apple
} from 'lucide-react';
import { NavTab, UserProfile } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenEmergency: () => void;
  userProfile: UserProfile;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenEmergency,
  userProfile,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);

  const navItems: { id: NavTab; label: string; icon: typeof Search; badge?: string }[] = [
    { id: 'find_healthcare' as NavTab, label: 'Find Healthcare', icon: Search },
    { id: 'ai_chatbot' as NavTab, label: 'AI Chatbot', icon: Bot },
    { id: 'womens_health' as NavTab, label: "Women's Health", icon: Flower2 },
    { id: 'health_diet' as NavTab, label: 'Health & Diet', icon: Apple },
    { id: 'appointments' as NavTab, label: 'Appointments', icon: Calendar },
    { id: 'health_history' as NavTab, label: 'Health History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Clinical Disclaimer Banner */}
      {disclaimerVisible && (
        <div 
          id="clinical-disclaimer-banner"
          className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="font-medium truncate sm:whitespace-normal">
              <span className="font-bold">Medical Disclaimer:</span> CareConnect AI provides health education and navigation assistance. It is not a substitute for professional clinical diagnosis. For immediate emergencies, call <span className="font-bold underline">112</span> or <span className="font-bold underline">108</span>.
            </p>
            <button
              id="dismiss-disclaimer-btn"
              onClick={() => setDisclaimerVisible(false)}
              className="ml-auto text-amber-700 hover:text-amber-950 font-semibold text-xs px-2 py-0.5 rounded hover:bg-amber-100/80 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Logo */}
          <div 
            id="brand-logo-btn"
            onClick={() => setActiveTab('find_healthcare')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
                  CareConnect
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-mono">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Intelligent Healthcare Navigation
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-200/60 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-teal-500 text-white leading-tight">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-teal-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Emergency Button */}
            <button
              id="header-emergency-btn"
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/25 transition-all hover:scale-105 active:scale-95 animate-pulse"
              title="Click for immediate 112 / 108 emergency & ambulance dispatch"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Emergency (112)</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs border border-teal-300">
                  {userProfile.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="font-semibold text-slate-800 truncate max-w-25">
                    {userProfile.fullName.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-teal-600 font-medium">
                    {userProfile.memberTier.includes('Premium') ? 'Premium' : 'Active'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div 
                  id="profile-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900">{userProfile.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      {userProfile.insuranceProvider}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      id="menu-account-settings-btn"
                      onClick={() => {
                        setActiveTab('account_settings');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2 font-medium"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      Account & Health Settings
                    </button>
                    <button
                      id="menu-my-history-btn"
                      onClick={() => {
                        setActiveTab('health_history');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2 font-medium"
                    >
                      <History className="w-4 h-4 text-slate-500" />
                      Encrypted Medical Records
                    </button>
                    {onLogout && (
                      <button
                        id="menu-logout-btn"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs sm:text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 font-medium border-t border-slate-100 mt-1 pt-3"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-700" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setActiveTab('account_settings');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <User className="w-5 h-5 text-slate-500" />
              <span>Profile & Account Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
