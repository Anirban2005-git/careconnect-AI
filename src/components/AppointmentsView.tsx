import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  ChevronRight, 
  User, 
  PhoneCall, 
  AlertCircle, 
  ExternalLink, 
  Download,
  Trash2,
  X,
  Star
} from 'lucide-react';
import { Provider, Appointment, UserProfile } from '../types';

interface AppointmentsViewProps {
  providers: Provider[];
  selectedProvider: Provider | null;
  onSelectProvider: (p: Provider) => void;
  appointments: Appointment[];
  onCreateAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onCancelAppointment: (id: string) => void;
  onRateAppointment: (id: string, rating: number) => void;
  userProfile: UserProfile;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  providers,
  selectedProvider,
  onSelectProvider,
  appointments,
  onCreateAppointment,
  onCancelAppointment,
  onRateAppointment,
  userProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'book' | 'my_visits'>('book');
  
  // Booking Wizard states
  const activeDoctor = selectedProvider || providers[0];
  const [selectedDate, setSelectedDate] = useState('2024-10-25');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [consultationType, setConsultationType] = useState<'telehealth' | 'in_person'>('telehealth');
  const [visitReason, setVisitReason] = useState('Consultation for recurring throbbing migraine, light sensitivity, and cycle correlation.');
  const [isGeneratingAiReason, setIsGeneratingAiReason] = useState(false);
  const [confirmedBookingModal, setConfirmedBookingModal] = useState<Appointment | null>(null);
  const [telehealthActiveRoom, setTelehealthActiveRoom] = useState<Appointment | null>(null);

  // Time slots
  const morningSlots = ['09:00 AM', '09:30 AM', '10:15 AM', '11:00 AM'];
  const afternoonSlots = ['01:30 PM', '02:45 PM', '04:00 PM', '05:15 PM'];

  const fee = activeDoctor.consultationFee;
  const insuranceCover = Math.round(fee * 0.8);
  const patientCopay = fee - insuranceCover;

  const handleGenerateAiReason = () => {
    setIsGeneratingAiReason(true);
    setTimeout(() => {
      setVisitReason(`Patient reports a 3-week history of unilateral throbbing temple headaches, visual aura, and elevated fatigue correlating with Day 14 ovulation phase. Requesting specialist neuro-evaluation and preventative therapy review.`);
      setIsGeneratingAiReason(false);
    }, 600);
  };

  const handleConfirmBooking = () => {
    const newApt: Omit<Appointment, 'id' | 'createdAt'> = {
      providerId: activeDoctor.id,
      providerName: activeDoctor.name,
      providerSpecialty: activeDoctor.specialty,
      providerAvatar: activeDoctor.avatarUrl,
      clinicAddress: activeDoctor.clinicAddress,
      date: selectedDate,
      time: selectedTime,
      type: consultationType,
      reason: visitReason,
      status: 'confirmed',
      consultationFee: fee,
      insuranceCoverage: insuranceCover,
      patientCopay: patientCopay,
      meetingLink: consultationType === 'telehealth' ? `https://careconnect.health/room/apt-${Date.now()}` : undefined,
    };

    onCreateAppointment(newApt);
    setConfirmedBookingModal({
      ...newApt,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Sub-navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Specialist Appointments & Telehealth
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Schedule visits with top board-certified physicians and manage active appointments
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            id="tab-book-new-visit"
            onClick={() => setActiveTab('book')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'book'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Schedule Visit
          </button>
          <button
            id="tab-my-scheduled-visits"
            onClick={() => setActiveTab('my_visits')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'my_visits'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Visits</span>
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center">
              {appointments.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'book' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Doctor Picker + Calendar & Slot Selection */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Choose Provider Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step 1: Choose Your Specialist
                </span>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                  AI Recommended
                </span>
              </div>

              {/* Doctor horizontal selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {providers.filter(p => !p.isUrgentFacility).slice(0, 4).map((prov) => {
                  const isSelected = prov.id === activeDoctor.id;
                  return (
                    <div
                      key={prov.id}
                      onClick={() => onSelectProvider(prov)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-1 ring-teal-400'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={prov.id === 'dr-rajiv-mehta' ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' : prov.avatarUrl}
                        alt={prov.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {prov.name}
                        </h4>
                        <p className="text-[11px] text-teal-700 font-medium truncate">
                          {prov.specialty}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          ₹{prov.consultationFee} • {prov.rating} ★
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Choose Date & Time */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 2: Select Date & Time Slot
              </span>

              {/* Date Quick Buttons */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Available Dates:</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { label: 'Tomorrow', date: '2024-10-25', day: 'Fri, Oct 25' },
                    { label: 'Monday', date: '2024-10-28', day: 'Mon, Oct 28' },
                    { label: 'Tuesday', date: '2024-10-29', day: 'Tue, Oct 29' },
                    { label: 'Wednesday', date: '2024-10-30', day: 'Wed, Oct 30' },
                  ].map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setSelectedDate(d.date)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                        selectedDate === d.date
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-[10px] font-normal opacity-80">{d.label}</div>
                      <div>{d.day}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots (Morning & Afternoon) */}
              <div className="space-y-3 pt-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Morning Slots:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {morningSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          selectedTime === slot
                            ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Afternoon Slots:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {afternoonSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          selectedTime === slot
                            ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* 3. Visit Type & Clinical Reason */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 3: Consultation Format & Reason
              </span>

              {/* Format selection */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setConsultationType('telehealth')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    consultationType === 'telehealth'
                      ? 'border-teal-500 bg-teal-50/80 text-teal-950 ring-1 ring-teal-400'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm">Telehealth Video</h5>
                    <p className="text-[10px] text-slate-500">100% Online HD Consult</p>
                  </div>
                </div>

                <div
                  onClick={() => setConsultationType('in_person')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    consultationType === 'in_person'
                      ? 'border-teal-500 bg-teal-50/80 text-teal-950 ring-1 ring-teal-400'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm">In-Person Clinic</h5>
                    <p className="text-[10px] text-slate-500">At Beverly Hills Clinic</p>
                  </div>
                </div>
              </div>

              {/* Reason For Visit input with AI autofill button */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Reason For Visit / Symptoms:</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiReason}
                    disabled={isGeneratingAiReason}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                    <span>Auto-Summarize from AI Logs</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

            </div>

          </div>

          {/* Right Column: Sticky Summary & Instant Confirmation */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-5">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
                Appointment Summary
              </h3>

              {/* Doctor Details */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <img
                  src={activeDoctor.id === 'dr-rajiv-mehta' ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' : activeDoctor.avatarUrl}
                  alt={activeDoctor.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{activeDoctor.name}</h4>
                  <p className="text-xs text-teal-700 font-semibold truncate">{activeDoctor.specialty}</p>
                  <p className="text-[11px] text-slate-500 truncate">{activeDoctor.hospitalAffiliation}</p>
                </div>
              </div>

              {/* Slot Details */}
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Date:
                  </span>
                  <span className="font-bold text-slate-900">{selectedDate}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    Time:
                  </span>
                  <span className="font-bold text-slate-900">{selectedTime}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-teal-600" />
                    Format:
                  </span>
                  <span className="font-bold text-slate-900 capitalize">{consultationType.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Standard Consultation Fee</span>
                  <span>₹{fee}.00</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Insurance Coverage ({userProfile.insuranceProvider.split(' ')[0]})
                  </span>
                  <span>-₹{insuranceCover}.00</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-100">
                  <span>Your Estimated Copay</span>
                  <span className="text-teal-700">₹{patientCopay}.00</span>
                </div>
              </div>

              {/* Confirm CTA */}
              <button
                id="confirm-appointment-cta-btn"
                onClick={handleConfirmBooking}
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Book Appointment</span>
              </button>

              <div className="text-[10px] text-center text-slate-400">
                Free cancellation up to 2 hours before visit. Encrypted & HIPAA Compliant.
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* My Scheduled Visits View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Active & Past Appointments ({appointments.length})
            </h3>
            <button
              onClick={() => setActiveTab('book')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200"
            >
              + Book Another Visit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {appointments.map((apt) => {
              const isConfirmed = apt.status === 'confirmed';
              return (
                <div
                  key={apt.id}
                  id={`my-apt-card-${apt.id}`}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={apt.providerId === 'dr-rajiv-mehta' ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' : apt.providerAvatar}
                          alt={apt.providerName}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-bold text-base text-slate-900">{apt.providerName}</h4>
                          <p className="text-xs text-teal-700 font-semibold">{apt.providerSpecialty}</p>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                            isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isConfirmed ? '✓ Confirmed Visit' : 'Completed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Date & Time:</span>
                        <span className="font-bold text-slate-900">{apt.date} at {apt.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Consultation Format:</span>
                        <span className="font-semibold text-slate-900 capitalize">{apt.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Copay Paid:</span>
                        <span className="font-bold text-teal-700">₹{apt.patientCopay}.00</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100">
                      <span className="font-bold text-teal-950">Clinical Notes: </span>
                      {apt.reason}
                    </p>

                    {apt.status === 'completed' && (
                      <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2">
                        <span className="text-xs font-semibold text-slate-700">
                          {apt.rating ? 'Your rating' : 'Rate this visit'}
                        </span>
                        <div className="flex items-center gap-0.5" aria-label="Rate this visit">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => onRateAppointment(apt.id, value)}
                              className="p-1 rounded-md hover:bg-amber-100 transition-colors"
                              aria-label={`Give ${value} star${value === 1 ? '' : 's'}`}
                            >
                              <Star className={`w-4 h-4 ${value <= (apt.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {apt.type === 'telehealth' && isConfirmed && (
                      <button
                        onClick={() => setTelehealthActiveRoom(apt)}
                        className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Telehealth Call</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => onCancelAppointment(apt.id)}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                      title="Cancel appointment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmedBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Appointment Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your visit with <span className="font-bold text-slate-800">{confirmedBookingModal.providerName}</span> is scheduled.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-700 space-y-1.5 text-left border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-slate-900">{confirmedBookingModal.date} at {confirmedBookingModal.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-bold text-slate-900 capitalize">{confirmedBookingModal.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Copay Responsibility:</span>
                <span className="font-bold text-teal-700">₹{confirmedBookingModal.patientCopay}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SMS / Email Reminders:</span>
                <span className="font-semibold text-emerald-700">Active ({userProfile.phone})</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setConfirmedBookingModal(null);
                  setActiveTab('my_visits');
                }}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
              >
                View in My Appointments
              </button>
              <button
                onClick={() => setConfirmedBookingModal(null)}
                className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Telehealth Video Call Room */}
      {telehealthActiveRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-700 overflow-hidden shadow-2xl flex flex-col text-white">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-bold text-sm">CareConnect HD Telehealth Suite</h4>
              </div>
              <button onClick={() => setTelehealthActiveRoom(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 text-center space-y-5">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-teal-400 mx-auto shadow-xl">
                <img
                  src={telehealthActiveRoom.providerId === 'dr-rajiv-mehta' ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' : telehealthActiveRoom.providerAvatar}
                  alt={telehealthActiveRoom.providerName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold">{telehealthActiveRoom.providerName}</h3>
                <p className="text-xs text-teal-300">{telehealthActiveRoom.providerSpecialty}</p>
                <p className="text-xs text-slate-400 mt-1">Waiting room connected • Encrypted 256-bit WebRTC</p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl text-xs text-slate-300 max-w-md mx-auto">
                Doctor is reviewing your logged symptoms and will connect audio-video feed shortly.
              </div>

              <button
                onClick={() => setTelehealthActiveRoom(null)}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
