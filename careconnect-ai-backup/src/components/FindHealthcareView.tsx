import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Star, 
  Calendar, 
  ShieldCheck, 
  Video, 
  Clock, 
  Bot, 
  PhoneCall, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  Heart,
  Stethoscope,
  Building2,
  X
} from 'lucide-react';
import { Provider, NavTab } from '../types';

interface FindHealthcareViewProps {
  providers: Provider[];
  onSelectProviderForBooking: (provider: Provider) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenEmergency: () => void;
}

export const FindHealthcareView: React.FC<FindHealthcareViewProps> = ({
  providers,
  onSelectProviderForBooking,
  onNavigateTab,
  onOpenEmergency,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterTelehealthOnly, setFilterTelehealthOnly] = useState(false);
  const [filterHighRating, setFilterHighRating] = useState(false);
  const [selectedProviderDetails, setSelectedProviderDetails] = useState<Provider | null>(null);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});

  const categories = [
    { id: 'all', label: 'All Specializations' },
    { id: 'neurology', label: 'Neurology' },
    { id: 'obgyn', label: "Women's Health / OB-GYN" },
    { id: 'cardiology', label: 'Cardiology' },
    { id: 'general', label: 'Family & General' },
    { id: 'urgent_care', label: 'Urgent Care & ER' },
    { id: 'dermatology', label: 'Dermatology' },
  ];

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Telehealth filter
      if (filterTelehealthOnly && !p.telehealthAvailable) {
        return false;
      }
      // Rating filter
      if (filterHighRating && p.rating < 4.85) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSpecialty = p.specialty.toLowerCase().includes(q);
        const matchesHospital = p.hospitalAffiliation.toLowerCase().includes(q);
        const matchesBio = p.bio.toLowerCase().includes(q);
        const matchesAi = p.aiMatchReason?.toLowerCase().includes(q);
        return matchesName || matchesSpecialty || matchesHospital || matchesBio || matchesAi;
      }
      return true;
    });
  }, [providers, selectedCategory, filterTelehealthOnly, filterHighRating, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Section */}
      <section 
        id="hero-banner-section" 
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-teal-700/40"
      >
        {/* Background ambient medical graphic glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
              <span>Next-Generation Healthcare Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Your Health Journey, <br className="hidden sm:inline" />
              <span className="bg-linear-to-rfrom-teal-200 via-cyan-300 to-white bg-clip-text text-transparent">
                Intelligently Guided.
              </span>
            </h1>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              Connect with top certified medical specialists, track your cycle and vitals, and receive instant 24/7 clinical AI symptom assessment—all in one secure platform.
            </p>

            {/* Quick Action Hero Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-find-care-cta"
                onClick={() => {
                  document.getElementById('search-doctors-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Find Specialists
              </button>

              <button
                id="hero-ask-ai-cta"
                onClick={() => onNavigateTab('ai_chatbot')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Bot className="w-4 h-4 text-cyan-300" />
                Ask AI Assistant
              </button>
            </div>
          </div>

          {/* Right Floating Assessment Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/30 flex items-center justify-center border border-teal-300/40">
                    <Activity className="w-5 h-5 text-teal-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">AI Health Assessment</p>
                    <p className="text-[10px] text-teal-200">Real-time symptom triage</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400 text-slate-950">
                  98% Accuracy
                </span>
              </div>

              {/* Assessment simulated metrics */}
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Target Specialty Match:</span>
                  <span className="font-semibold text-cyan-300">Neurology & OB-GYN</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Current Health Rhythm:</span>
                  <span className="font-semibold text-emerald-300">Ovulation (Day 14/28)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Vitals Status:</span>
                  <span className="font-semibold text-teal-200">118/76 mmHg • Optimal</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => onNavigateTab('ai_chatbot')}
                  className="w-full py-2.5 rounded-lg bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 transition-all"
                >
                  <span>Start Free AI Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Quick Action Navigation Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* 1. Emergency Care */}
        <div
          id="card-quick-emergency"
          onClick={onOpenEmergency}
          className="group p-4 rounded-2xl bg-red-50 hover:bg-red-100/90 border border-red-200/80 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center mb-3 shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-red-950 group-hover:text-red-700 transition-colors">
            Emergency Care
          </h3>
          <p className="text-xs text-red-800/80 mt-1">
            Instant 911 call, nearest ER wait times & GPS routing.
          </p>
        </div>

        {/* 2. My Appointments */}
        <div
          id="card-quick-appointments"
          onClick={() => onNavigateTab('appointments')}
          className="group p-4 rounded-2xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200/70 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-3 shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-teal-950 group-hover:text-teal-700 transition-colors">
            My Appointments
          </h3>
          <p className="text-xs text-teal-800/80 mt-1">
            Manage upcoming visits, telehealth links & bookings.
          </p>
        </div>

        {/* 3. Health History */}
        <div
          id="card-quick-history"
          onClick={() => onNavigateTab('health_history')}
          className="group p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/70 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-indigo-950 group-hover:text-indigo-700 transition-colors">
            Health History
          </h3>
          <p className="text-xs text-indigo-800/80 mt-1">
            Access encrypted symptom charts, vitals & lab records.
          </p>
        </div>

        {/* 4. Women's Health */}
        <div
          id="card-quick-womens-health"
          onClick={() => onNavigateTab('womens_health')}
          className="group p-4 rounded-2xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200/70 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-md shadow-rose-600/20 group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-rose-950 group-hover:text-rose-700 transition-colors">
            Women's Health
          </h3>
          <p className="text-xs text-rose-800/80 mt-1">
            Track menstrual cycle, ovulation phases & customized diet.
          </p>
        </div>

      </section>

      {/* Main Search & Provider Directory Section */}
      <section id="search-doctors-section" className="space-y-6">
        
        {/* Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Top Medical Specialists & Facilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Verified board-certified physicians, high-rated clinics, and urgent care centers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredProviders.length} providers
            </span>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="find-care-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors, specialties (e.g. Neurologist, Cardiologist), symptoms, clinics..."
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Toggle Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto px-1 sm:px-0">
            <button
              onClick={() => setFilterTelehealthOnly(!filterTelehealthOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                filterTelehealthOnly
                  ? 'bg-teal-50 border-teal-500 text-teal-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-teal-600" />
              <span>Telehealth Only</span>
            </button>

            <button
              onClick={() => setFilterHighRating(!filterHighRating)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                filterHighRating
                  ? 'bg-amber-50 border-amber-500 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>4.85+ Rating</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              id={`provider-card-${provider.id}`}
              className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-4">
                
                {/* AI Match Badge or Urgent Care Indicator */}
                {provider.aiMatchReason && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-[11px] font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{provider.aiMatchReason}</span>
                  </div>
                )}

                {provider.isUrgentFacility && (
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-900 text-[11px] font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-red-600" />
                      Wait: {provider.emergencyWaitTime}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-red-700">Open 24/7</span>
                  </div>
                )}

                {/* Doctor Head Info */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={provider.id === 'dr-sneha-mukherjee'
                      ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
                      : provider.id === 'dr-rajiv-mehta'
                      ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
                      : provider.id === 'dr-debashis-banerjee'
                      ? 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400'
                      : provider.avatarUrl}
                    alt={provider.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.currentTarget.src = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                      {provider.name}
                    </h3>
                    <p className="text-xs text-teal-700 font-semibold truncate">
                      {provider.specialty}
                    </p>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      {provider.hospitalAffiliation}
                    </p>
                  </div>
                </div>

                {/* Badges & Metrics */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-slate-800 font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{provider.rating}</span>
                    <span className="text-slate-400 font-normal">({provider.reviewsCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{provider.distance}</span>
                  </div>
                  <div className="font-bold text-slate-900">
                    ₹{provider.consultationFee} <span className="text-[10px] text-slate-400 font-normal">/ visit</span>
                  </div>
                </div>

                {/* Next Availability */}
                <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Next Available:
                  </span>
                  <span className="font-bold text-slate-900">
                    {provider.nextAvailable}
                  </span>
                </div>

                {/* Accepted Insurances pill */}
                <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Covers: {provider.insuranceAccepted.slice(0, 3).join(', ')}...</span>
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                <button
                  id={`view-details-${provider.id}`}
                  onClick={() => setSelectedProviderDetails(provider)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold transition-all hover:bg-slate-50"
                >
                  Doctor Bio
                </button>
                <button
                  id={`book-doctor-${provider.id}`}
                  onClick={() => onSelectProviderForBooking(provider)}
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all hover:shadow-teal-600/20 active:scale-95 flex items-center justify-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Visit</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No doctors match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or reset filter tags to see all medical specialists.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterTelehealthOnly(false);
                setFilterHighRating(false);
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}

      </section>

      {/* Provider Details Modal */}
      {selectedProviderDetails && (
        <div 
          id="provider-details-modal"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Provider Credentials & Profile</h3>
              <button
                onClick={() => setSelectedProviderDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-start gap-4">
                <img
                  src={selectedProviderDetails.id === 'dr-sneha-mukherjee'
                    ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
                    : selectedProviderDetails.id === 'dr-rajiv-mehta'
                    ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
                    : selectedProviderDetails.id === 'dr-debashis-banerjee'
                    ? 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400'
                    : selectedProviderDetails.avatarUrl}
                  alt={selectedProviderDetails.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.src = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400';
                  }}
                />
                <div>
                  <h4 className="font-bold text-lg text-slate-900">{selectedProviderDetails.name}</h4>
                  <p className="text-sm font-semibold text-teal-700">{selectedProviderDetails.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedProviderDetails.hospitalAffiliation}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {selectedProviderDetails.rating} ({selectedProviderDetails.reviewsCount} verified reviews)
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{selectedProviderDetails.experienceYears} Years Exp.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5">
                <span className="text-xs font-semibold text-slate-700">
                  {userRatings[selectedProviderDetails.id] ? 'Your rating' : 'Rate this provider'}
                </span>
                <div className="flex items-center gap-0.5" aria-label="Rate this provider">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setUserRatings((previous) => ({
                        ...previous,
                        [selectedProviderDetails.id]: value,
                      }))}
                      className="p-1 rounded-md hover:bg-amber-100 transition-colors"
                      aria-label={`Give ${value} star${value === 1 ? '' : 's'}`}
                    >
                      <Star className={`w-4 h-4 ${value <= (userRatings[selectedProviderDetails.id] || 0) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Clinical Biography</h5>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {selectedProviderDetails.bio}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Clinic Location & Directions</h5>
                <p className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-red-500" />
                  {selectedProviderDetails.clinicAddress} ({selectedProviderDetails.distance})
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Accepted Health Insurance Plans</h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProviderDetails.insuranceAccepted.map((ins, i) => (
                    <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ✓ {ins}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Consultation Fee</p>
                  <p className="text-lg font-black text-slate-900">₹{selectedProviderDetails.consultationFee} <span className="text-xs font-normal text-slate-400">/ session</span></p>
                </div>
                <button
                  onClick={() => {
                    const prov = selectedProviderDetails;
                    setSelectedProviderDetails(null);
                    onSelectProviderForBooking(prov);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20"
                >
                  Schedule with {selectedProviderDetails.name.split(' ')[1]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
