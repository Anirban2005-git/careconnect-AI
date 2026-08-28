import React, { useState } from 'react';
import { 
  Activity, 
  Calendar, 
  FileText, 
  Sparkles, 
  Heart, 
  TrendingUp, 
  ShieldCheck, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Download, 
  Clock, 
  AlertCircle,
  Droplets,
  Moon,
  X
} from 'lucide-react';
import { SymptomLog, Appointment, ChatSession, UserProfile, CycleData } from '../types';

interface HealthHistoryViewProps {
  symptomLogs: SymptomLog[];
  appointments: Appointment[];
  chatSessions: ChatSession[];
  cycleData: CycleData;
  userProfile: UserProfile;
  onOpenLogSymptomModal: () => void;
  onSelectChatSession: (id: string) => void;
  onDeleteSymptomLog: (id: string) => void;
}

export const HealthHistoryView: React.FC<HealthHistoryViewProps> = ({
  symptomLogs,
  appointments,
  chatSessions,
  cycleData,
  userProfile,
  onOpenLogSymptomModal,
  onSelectChatSession,
  onDeleteSymptomLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'symptoms' | 'ai_chats' | 'cycle' | 'vitals'>('overview');
  const [selectedTranscriptModal, setSelectedTranscriptModal] = useState<ChatSession | null>(null);

  // Vitals State
  const [vitalsList, setVitalsList] = useState([
    { name: 'Blood Pressure', value: '118/76', unit: 'mmHg', status: 'Optimal', date: 'Oct 20, 2024' },
    { name: 'Resting Heart Rate', value: '72', unit: 'bpm', status: 'Normal', date: 'Oct 23, 2024' },
    { name: 'Fasting Blood Glucose', value: '94', unit: 'mg/dL', status: 'Optimal', date: 'Oct 15, 2024' },
    { name: 'Total Cholesterol', value: '178', unit: 'mg/dL', status: 'Optimal', date: 'Oct 15, 2024' },
  ]);

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [newVitalName, setNewVitalName] = useState('Blood Pressure');
  const [newVitalValue, setNewVitalValue] = useState('');

  const nextAppointment = appointments.find(a => a.status === 'confirmed');

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Encrypted Health Records & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Unified timeline of your clinical consultations, symptoms, cycle trends, and vital signs
          </p>
        </div>

        {/* Subtabs selector */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-2xl scrollbar-none">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'symptoms', label: 'Symptom Tracker' },
            { id: 'ai_chats', label: 'AI Consultations' },
            { id: 'cycle', label: 'Menstrual Records' },
            { id: 'vitals', label: 'Vitals & Labs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSubTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Top Row: Next Visit Card + Wellness Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Next Visit Card */}
            <div className="lg:col-span-6 bg-linear-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold border border-teal-400/30">
                    <Calendar className="w-3.5 h-3.5 text-teal-300" />
                    Next Scheduled Visit
                  </span>
                  <span className="text-xs text-slate-300">Telehealth HD</span>
                </div>

                {nextAppointment ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={nextAppointment.providerId === 'dr-rajiv-mehta' ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' : nextAppointment.providerAvatar}
                        alt={nextAppointment.providerName}
                        className="w-14 h-14 rounded-2xl object-cover border border-teal-400/40"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="font-bold text-lg text-white">{nextAppointment.providerName}</h3>
                        <p className="text-xs text-teal-300 font-semibold">{nextAppointment.providerSpecialty}</p>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {nextAppointment.date} at {nextAppointment.time}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-white/10 rounded-2xl text-xs text-slate-200 border border-white/10">
                      <span className="font-bold text-white">Focus: </span>
                      {nextAppointment.reason}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-300">No active visits scheduled.</p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">Coverage: {userProfile.insuranceProvider.split(' ')[0]}</span>
                <span className="font-bold text-teal-300">Status: Confirmed</span>
              </div>
            </div>

            {/* Wellness 30-Day Snapshot */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                30-Day Physiological Snapshot
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-1">
                  <span className="text-slate-500 font-medium">Avg. Sleep Duration</span>
                  <p className="text-lg font-black text-teal-950">7h 30m</p>
                  <span className="text-[10px] text-teal-700 font-semibold">✓ 92% Restful score</span>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-50/70 border border-cyan-100 space-y-1">
                  <span className="text-slate-500 font-medium">Hydration Avg.</span>
                  <p className="text-lg font-black text-cyan-950">2,100 ml</p>
                  <span className="text-[10px] text-cyan-700 font-semibold">Target: 2,500 ml</span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-1">
                  <span className="text-slate-500 font-medium">Cycle Regularity</span>
                  <p className="text-lg font-black text-rose-950">{cycleData.regularityScore}%</p>
                  <span className="text-[10px] text-rose-700 font-semibold">28-day standard rhythm</span>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                  <span className="text-slate-500 font-medium">Resting Vitals</span>
                  <p className="text-lg font-black text-indigo-950">118/76</p>
                  <span className="text-[10px] text-indigo-700 font-semibold">Optimal blood pressure</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Data encrypted with HIPAA-compliant standards.
              </div>
            </div>

          </div>

          {/* Recent Symptoms & Log History */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Recent Symptom Logs</h3>
                <p className="text-xs text-slate-500">Tracked signals with clinical AI synthesis</p>
              </div>
              <button
                onClick={onOpenLogSymptomModal}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Symptom</span>
              </button>
            </div>

            <div className="space-y-3">
              {symptomLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-500">{log.date}</span>
                      {log.cycleDay && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Cycle Day {log.cycleDay}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.severity === 'Severe'
                          ? 'bg-red-100 text-red-800'
                          : log.severity === 'Moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {log.severity}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {log.symptoms.map((s, i) => (
                        <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800">
                          {s}
                        </span>
                      ))}
                    </div>

                    {log.aiInsight && (
                      <p className="text-xs text-teal-800 bg-teal-50/70 p-2 rounded-xl border border-teal-100">
                        <span className="font-bold">AI Insight: </span>
                        {log.aiInsight}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteSymptomLog(log.id)}
                    className="text-slate-400 hover:text-red-600 p-2 rounded-lg"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 2. SYMPTOM TRACKER TAB */}
      {activeSubTab === 'symptoms' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  30-Day Symptom Frequency Analysis
                </h3>
                <p className="text-xs text-slate-500">Weekly symptom occurrences and severity trends</p>
              </div>
            </div>

            {/* Interactive Bar Chart Representation */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
              {[
                { label: 'Week 1 (Oct 1-7)', count: 2, height: '40%', color: 'bg-teal-400' },
                { label: 'Week 2 (Oct 8-14)', count: 5, height: '85%', color: 'bg-rose-500', note: 'Menstrual Peak' },
                { label: 'Week 3 (Oct 15-21)', count: 1, height: '25%', color: 'bg-teal-400' },
                { label: 'Week 4 (Oct 22-28)', count: 3, height: '55%', color: 'bg-purple-500', note: 'Ovulation Peak' },
              ].map((w, idx) => (
                <div key={idx} className="space-y-2 flex flex-col items-center">
                  <div className="h-32 w-full max-w-15 bg-slate-100 rounded-2xl relative flex items-end justify-center p-1">
                    <div
                      className={`w-full rounded-xl ${w.color} transition-all duration-700`}
                      style={{ height: w.height }}
                    />
                  </div>
                  <span className="font-bold text-xs text-slate-900">{w.count} events</span>
                  <span className="text-[10px] text-slate-400">{w.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Historical Symptom Logbook</h3>
              <button
                onClick={onOpenLogSymptomModal}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                + Record Entry
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Date</th>
                    <th>Cycle Day</th>
                    <th>Symptoms</th>
                    <th>Severity</th>
                    <th>Clinical Insight</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {symptomLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-900 whitespace-nowrap">{log.date}</td>
                      <td>Day {log.cycleDay || 'N/A'}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {log.symptoms.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          log.severity === 'Severe' ? 'bg-red-100 text-red-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="max-w-md whitespace-pre-line text-slate-600">{log.aiInsight || 'Recorded'}</td>
                      <td>
                        <button
                          onClick={() => onDeleteSymptomLog(log.id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. AI CONSULTATIONS TAB */}
      {activeSubTab === 'ai_chats' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Encrypted AI Consultation Transcripts</h3>
            <span className="text-xs text-slate-500">HIPAA Protected Log</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-teal-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      Gemini 3.7 Clinical Session
                    </span>
                    <span className="text-[10px] text-slate-400">{session.createdAt}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{session.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {session.messages[session.messages.length - 1]?.content.slice(0, 140) || 'Session transcript...'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{session.messages.length} exchanges</span>
                  <button
                    onClick={() => setSelectedTranscriptModal(session)}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors"
                  >
                    View Full Transcript
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MENSTRUAL RECORDS TAB */}
      {activeSubTab === 'cycle' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Average Cycle Length</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{cycleData.averageCycleLength} Days</p>
              <span className="text-[10px] text-emerald-600 font-bold">✓ Highly regular rhythm</span>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Average Period Duration</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{cycleData.averagePeriodLength} Days</p>
              <span className="text-[10px] text-rose-600 font-bold">Standard 4-5 day flow</span>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">AI Regularity Score</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{cycleData.regularityScore}%</p>
              <span className="text-[10px] text-teal-600 font-bold">Optimal hormonal predictability</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Historical Cycle Log (Past 6 Months)</h3>
            <div className="space-y-2 text-xs">
              {[
                { period: 'Sep 13 – Oct 10, 2024', duration: '28 days', periodLen: '5 days', status: 'Regular' },
                { period: 'Aug 16 – Sep 12, 2024', duration: '28 days', periodLen: '5 days', status: 'Regular' },
                { period: 'Jul 19 – Aug 15, 2024', duration: '27 days', periodLen: '4 days', status: 'Regular' },
                { period: 'Jun 21 – Jul 18, 2024', duration: '28 days', periodLen: '5 days', status: 'Regular' },
              ].map((c, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{c.period}</p>
                    <p className="text-[11px] text-slate-500">Flow length: {c.periodLen}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{c.duration}</span>
                    <p className="text-[10px] text-emerald-600 font-semibold">{c.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. VITALS & LABS TAB */}
      {activeSubTab === 'vitals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Cardiovascular & Metabolic Vitals</h3>
              <p className="text-xs text-slate-500">Sync with clinic test results or manual blood pressure cuffs</p>
            </div>
            <button
              onClick={() => setShowVitalsModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
            >
              + Record Vital Sign
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vitalsList.map((vital, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{vital.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {vital.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900">{vital.value}</span>
                  <span className="text-xs text-slate-400 font-medium">{vital.unit}</span>
                </div>
                <p className="text-[10px] text-slate-400">Recorded: {vital.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {selectedTranscriptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedTranscriptModal.title}</h3>
                <p className="text-xs text-slate-400">{selectedTranscriptModal.createdAt}</p>
              </div>
              <button onClick={() => setSelectedTranscriptModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {selectedTranscriptModal.messages.map((m) => (
                <div key={m.id} className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' ? 'bg-slate-900 text-white ml-8' : 'bg-slate-50 text-slate-800 border border-slate-200 mr-8'
                }`}>
                  <p className="font-bold text-[10px] mb-1 opacity-70 uppercase">{m.role}</p>
                  <div className="whitespace-pre-line">{m.content}</div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTranscriptModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vitals Modal */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Record New Vital Sign</h3>
              <button onClick={() => setShowVitalsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Measurement Type:</label>
                <select
                  value={newVitalName}
                  onChange={(e) => setNewVitalName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs mt-1"
                >
                  <option value="Blood Pressure">Blood Pressure (e.g. 120/80 mmHg)</option>
                  <option value="Resting Heart Rate">Resting Heart Rate (bpm)</option>
                  <option value="Blood Glucose">Blood Glucose (mg/dL)</option>
                  <option value="Body Temperature">Body Temperature (°F)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Recorded Value:</label>
                <input
                  type="text"
                  value={newVitalValue}
                  onChange={(e) => setNewVitalValue(e.target.value)}
                  placeholder="e.g. 118/76 or 72"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs mt-1"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowVitalsModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newVitalValue) {
                    setVitalsList(prev => [
                      { name: newVitalName, value: newVitalValue, unit: newVitalName.includes('Pressure') ? 'mmHg' : 'bpm', status: 'Optimal', date: 'Just now' },
                      ...prev,
                    ]);
                  }
                  setShowVitalsModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
              >
                Save Vital
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
