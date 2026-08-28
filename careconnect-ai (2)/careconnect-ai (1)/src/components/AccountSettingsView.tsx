import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Bell, 
  Lock, 
  Heart, 
  PhoneCall, 
  CheckCircle2, 
  Sparkles,
  Save,
  CreditCard
} from 'lucide-react';
import { UserProfile } from '../types';

interface AccountSettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'personal' | 'health_prefs' | 'security' | 'notifications'>('personal');
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 font-black text-xl flex items-center justify-center border-2 border-teal-300 shadow-sm">
            {formData.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{formData.fullName}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500 text-white">
                {formData.memberTier}
              </span>
            </div>
            <p className="text-xs text-slate-500">{formData.email} • ID: {formData.id}</p>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">
              🛡️ {formData.insuranceProvider}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/20"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your health profile and notification preferences have been saved securely!</span>
        </div>
      )}

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-3 shadow-sm space-y-1">
          {[
            { id: 'personal', label: 'Personal Information', icon: User },
            { id: 'health_prefs', label: 'Health & Insurance Settings', icon: ShieldCheck },
            { id: 'notifications', label: 'Alerts & Reminders', icon: Bell },
            { id: 'security', label: 'Security & Encrypted ID', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  isSelected
                    ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Forms */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          
          {activeSubTab === 'personal' && (
            <form onSubmit={handleSave} className="space-y-4">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                Personal Identification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number (SMS Alert)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Blood Type</label>
                  <input
                    type="text"
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'health_prefs' && (
            <form onSubmit={handleSave} className="space-y-5 text-xs">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                Health Insurance & Clinical Settings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Insurance Provider</label>
                  <input
                    type="text"
                    value={formData.insuranceProvider}
                    onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Policy / Member ID</label>
                  <input
                    type="text"
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100 space-y-3">
                <h4 className="font-bold text-xs text-red-950 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-red-600" />
                  Primary Emergency Contact
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContact.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                      })}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                      })}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                      })}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Enable Women's Health & Cycle Tracking</span>
                    <span className="text-slate-500 text-[11px]">Enables ovulation forecast, phase diet & symptom logging</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.enableWomensHealth}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, enableWomensHealth: e.target.checked }
                    })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Share Encrypted Vitals with Attending Doctor</span>
                    <span className="text-slate-500 text-[11px]">Provides your doctor with 30-day vitals before scheduled visits</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.shareVitalsWithDoctors}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, shareVitalsWithDoctors: e.target.checked }
                    })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Save Health Preferences
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'notifications' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                Notification Channels & Frequency
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">SMS Appointment Reminders</span>
                    <span className="text-slate-500 text-[11px]">Receive text messages 24h & 2h before visits</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.smsReminders}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, smsReminders: e.target.checked }
                    })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Weekly Health Digest & Diet Insights</span>
                    <span className="text-slate-500 text-[11px]">Summary of cycle phases, hydration stats & symptom trends</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.emailSummaries}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, emailSummaries: e.target.checked }
                    })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {activeSubTab === 'security' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                Security & Encryption Protocols
              </h3>
              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-teal-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  AES-256 Medical Encryption Active
                </p>
                <p className="text-[11px] leading-relaxed">
                  Your consultations, cycle tracking records, and symptom logs are end-to-end encrypted under HIPAA compliant security parameters.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
