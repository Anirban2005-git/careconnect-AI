import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { EmergencyModal } from './components/EmergencyModal';
import { FindHealthcareView } from './components/FindHealthcareView';
import { AIChatbotView } from './components/AIChatbotView';
import { FloatingAIChat } from './components/FloatingAIChat';
import { WomensHealthView } from './components/WomensHealthView';
import { HealthDietView } from './components/HealthDietView';
import { AppointmentsView } from './components/AppointmentsView';
import { HealthHistoryView } from './components/HealthHistoryView';
import { AccountSettingsView } from './components/AccountSettingsView';
import { LogSymptomModal } from './components/LogSymptomModal';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { detectChatLanguage } from './services/chatLanguage';

import {
  NavTab,
  Provider,
  Appointment,
  UserProfile,
  CycleData,
  SymptomLog,
  ChatSession,
  ChatMessage,
} from './types';

import {
  providersList,
  initialAppointments,
  initialCycleData,
  initialSymptomLogs,
  initialChatSessions,
} from './data/mockData';

export default function App() {
  const { user, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<NavTab>('find_healthcare');
  const [dataLoading, setDataLoading] = useState(true);

  const [providers, setProviders] = useState<Provider[]>(providersList);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<Provider | null>(providersList[0]);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [userProfile, setUserProfile] = useState<UserProfile>(user || ({} as UserProfile));
  const [cycleData, setCycleData] = useState<CycleData>(initialCycleData);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>(initialSymptomLogs);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(initialChatSessions);
  const [currentSessionId, setCurrentSessionId] = useState<string>(initialChatSessions[0].id);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isLogSymptomOpen, setIsLogSymptomOpen] = useState(false);

  useEffect(() => {
    if (user) setUserProfile(user);
  }, [user]);

  const loadAllData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [providersRes, apts, symptoms, cycle, chats] = await Promise.all([
        api.getProviders().catch(() => ({ providers: providersList })),
        api.getAppointments().catch(() => initialAppointments),
        api.getSymptoms().catch(() => initialSymptomLogs),
        api.getCycle().catch(() => initialCycleData),
        api.getChatSessions().catch(() => initialChatSessions),
      ]);

      const loadedProviders = (providersRes.providers || providersList) as Provider[];
      setProviders(loadedProviders);
      setSelectedProviderForBooking(loadedProviders[0] || null);
      setAppointments(apts as Appointment[]);
      setSymptomLogs(symptoms as SymptomLog[]);
      if (cycle && Object.keys(cycle).length > 0) {
        setCycleData({ ...initialCycleData, ...cycle } as CycleData);
      }
      if (chats && chats.length > 0) {
        setChatSessions(chats as ChatSession[]);
        setCurrentSessionId(chats[0].id);
      }
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await api.getNearbyProviders({
              lat: String(pos.coords.latitude),
              lng: String(pos.coords.longitude),
              radiusKm: '15',
              sort: 'distance',
            });
            if (res.providers?.length) {
              setProviders(res.providers as Provider[]);
            }
          } catch {
            /* keep default providers */
          }
        },
        () => { /* location denied — mock data fallback */ }
      );
    }
  }, [loadAllData]);

  const saveChatSession = async (session: ChatSession) => {
    try {
      await api.saveChatSession(session);
    } catch {
      /* local state still updated */
    }
  };

  const handleSelectProviderForBooking = (provider: Provider) => {
    setSelectedProviderForBooking(provider);
    setActiveTab('appointments');
  };

  const handleBookSpecialistFromChat = (specialtyOrName: string) => {
    const matched =
      providers.find(
        (p) =>
          specialtyOrName.toLowerCase().includes(p.name.toLowerCase().split(' ')[1] || '---') ||
          specialtyOrName.toLowerCase().includes(p.specialty.toLowerCase())
      ) || providers[0];
    setSelectedProviderForBooking(matched);
    setActiveTab('appointments');
  };

  const handleSendMessage = async (text: string, attachments?: any[]) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments,
    };

    let updatedSession: ChatSession | null = null;
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          updatedSession = {
            ...s,
            lastMessageSnippet: text.slice(0, 45) + '...',
            messages: [...s.messages, userMsg],
          };
          return updatedSession;
        }
        return s;
      })
    );

    setIsAiLoading(true);
    try {
      const currentSession = chatSessions.find((s) => s.id === currentSessionId);
      const history = currentSession ? [...currentSession.messages, userMsg] : [userMsg];
      const data = await api.chat(history, userProfile);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'I am ready to help assess your health questions.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: data.isEmergency,
        suggestedSpecialist: data.suggestedSpecialist,
      };

      setChatSessions((prev) => {
        const next = prev.map((s) => {
          if (s.id === currentSessionId) {
            const session = {
              ...s,
              lastMessageSnippet: assistantMsg.content.slice(0, 45) + '...',
              messages: [...s.messages, assistantMsg],
            };
            saveChatSession(session);
            return session;
          }
          return s;
        });
        return next;
      });
    } catch (err) {
      console.error('Chat API error:', err);
      const responseLanguage = detectChatLanguage(text);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        content: responseLanguage === 'bn'
          ? `### চিকিৎসা স্বাস্থ্য পরামর্শ\nআপনার নিরাপত্তার জন্য শান্ত জায়গায় বিশ্রাম নিন, পর্যাপ্ত পানি পান করুন এবং অস্বস্তি থাকলে প্রাথমিক চিকিৎসকের পরামর্শ নিন।\n\n*সাধারণ স্বাস্থ্য তথ্য; এটি চিকিৎসা রোগ নির্ণয় নয়।*`
          : responseLanguage === 'hi'
            ? `### स्वास्थ्य संबंधी सलाह\nअपनी सुरक्षा के लिए शांत जगह पर आराम करें, पर्याप्त पानी पिएं और परेशानी बनी रहने पर प्राथमिक चिकित्सक से सलाह लें।\n\n*यह सामान्य स्वास्थ्य जानकारी है; चिकित्सा निदान नहीं है।*`
            : `### Clinical Health Guidance\nFor your safety, please rest in a quiet area, maintain hydration, and consider scheduling a consult with your primary care provider if discomfort persists.\n\n*General information only — not a medical diagnosis.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            const session = { ...s, messages: [...s.messages, fallbackMsg] };
            saveChatSession(session);
            return session;
          }
          return s;
        })
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateNewSession = () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New Clinical Consultation',
      createdAt: 'Just now',
      lastMessageSnippet: 'How can I assist you with your health today?',
      messages: [
        {
          id: `m-init-${Date.now()}`,
          role: 'assistant',
          content: `Hello ${userProfile.fullName?.split(' ')[0] || 'there'}, I am your **CareConnect AI Health Assistant**.\n\nYou can describe symptoms, ask about medication interactions, review cycle and vitals logs, or ask for doctor recommendations. How can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    saveChatSession(newSession);
  };

  const handleDeleteSession = async (id: string) => {
    if (chatSessions.length <= 1) return;
    const remaining = chatSessions.filter((s) => s.id !== id);
    setChatSessions(remaining);
    if (currentSessionId === id) setCurrentSessionId(remaining[0].id);
    try {
      await api.deleteChatSession(id);
    } catch {
      /* ignore */
    }
  };

  const handleLogSymptom = async (log: Omit<SymptomLog, 'id'>) => {
    try {
      const saved = await api.createSymptom({
        ...log,
        cycleDay: log.cycleDay || cycleData.currentCycleDay,
        cyclePhase: cycleData.currentPhase,
      });
      setSymptomLogs((prev) => [saved as SymptomLog, ...prev]);
    } catch {
      const newLog: SymptomLog = {
        ...log,
        id: `symp-${Date.now()}`,
        aiInsight: `### Cycle-stage guidance\nYour symptoms may align with the ${cycleData.currentPhase} phase.\n\n**Precautions:** Rest and monitor symptoms. Seek medical care for severe or worsening symptoms or unusual heavy bleeding.\n\n**Food:** Choose leafy greens, lentils, ragi, fruit, and protein.\n\n**Hydration:** Drink fluids regularly through the day.\n\n**Sleep and self-care:** Aim for 7-9 hours of sleep, take screen breaks, and try gentle stretching or a warm compress.\n\n*General information only - not a medical diagnosis.*`,
      };
      setSymptomLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleDeleteSymptomLog = async (id: string) => {
    setSymptomLogs((prev) => prev.filter((l) => l.id !== id));
    try {
      await api.deleteSymptom(id);
    } catch {
      /* ignore */
    }
  };

  const handleCreateAppointment = async (apt: Omit<Appointment, 'id' | 'createdAt'>) => {
    try {
      const saved = await api.createAppointment(apt);
      setAppointments((prev) => [saved as Appointment, ...prev]);
    } catch {
      const newApt: Appointment = { ...apt, id: `apt-${Date.now()}`, createdAt: new Date().toISOString() };
      setAppointments((prev) => [newApt, ...prev]);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    try {
      await api.cancelAppointment(id);
    } catch {
      /* ignore */
    }
  };

  const handleRateAppointment = async (id: string, rating: number) => {
    setAppointments((prev) => prev.map((appointment) => (
      appointment.id === id ? { ...appointment, rating } : appointment
    )));
    try {
      await api.updateAppointment(id, { rating });
    } catch {
      /* keep the local rating when the API is unavailable */
    }
  };

  const handleUpdateCycle = async (
    newDay: number,
    phase: CycleData['currentPhase'],
    cycleDetails?: { periodStartDate?: string; periodLength?: number; cycleLength?: number }
  ) => {
    const updated = {
      ...cycleData,
      currentCycleDay: newDay,
      currentPhase: phase,
      daysUntilNextPeriod: Math.max((cycleDetails?.cycleLength || cycleData.totalCycleDays) - newDay, 0),
      ...(cycleDetails?.periodStartDate ? { lastPeriodStartDate: cycleDetails.periodStartDate } : {}),
      ...(cycleDetails?.periodLength ? { averagePeriodLength: cycleDetails.periodLength } : {}),
      ...(cycleDetails?.cycleLength ? { averageCycleLength: cycleDetails.cycleLength, totalCycleDays: cycleDetails.cycleLength } : {}),
      ...(cycleDetails?.periodStartDate && cycleDetails?.cycleLength ? { nextPeriodDate: new Date(new Date(cycleDetails.periodStartDate + 'T00:00:00').setDate(new Date(cycleDetails.periodStartDate + 'T00:00:00').getDate() + cycleDetails.cycleLength)).toISOString().slice(0, 10) } : {}),
    };
    setCycleData(updated);
    try {
      await api.updateCycle(updated);
    } catch {
      /* ignore */
    }
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      await updateUser(updated);
    } catch {
      /* ignore */
    }
  };

  if (dataLoading && !userProfile.fullName) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/55 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white antialiased">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        userProfile={userProfile}
        onLogout={logout}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'find_healthcare' && (
          <FindHealthcareView
            providers={providers}
            onSelectProviderForBooking={handleSelectProviderForBooking}
            onNavigateTab={setActiveTab}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {activeTab === 'ai_chatbot' && (
          <AIChatbotView
            chatSessions={chatSessions}
            currentSessionId={currentSessionId}
            onSelectSession={setCurrentSessionId}
            onCreateNewSession={handleCreateNewSession}
            onDeleteSession={handleDeleteSession}
            onSendMessage={handleSendMessage}
            isLoading={isAiLoading}
            onBookSpecialist={handleBookSpecialistFromChat}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'womens_health' && (
          <WomensHealthView
            cycleData={cycleData}
            symptomLogs={symptomLogs}
            onLogSymptom={handleLogSymptom}
            onUpdateCycle={handleUpdateCycle}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'health_diet' && <HealthDietView />}

        {activeTab === 'appointments' && (
          <AppointmentsView
            providers={providers}
            selectedProvider={selectedProviderForBooking}
            onSelectProvider={setSelectedProviderForBooking}
            appointments={appointments}
            onCreateAppointment={handleCreateAppointment}
            onCancelAppointment={handleCancelAppointment}
            onRateAppointment={handleRateAppointment}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'health_history' && (
          <HealthHistoryView
            symptomLogs={symptomLogs}
            appointments={appointments}
            chatSessions={chatSessions}
            cycleData={cycleData}
            userProfile={userProfile}
            onOpenLogSymptomModal={() => setIsLogSymptomOpen(true)}
            onSelectChatSession={(id) => {
              setCurrentSessionId(id);
              setActiveTab('ai_chatbot');
            }}
            onDeleteSymptomLog={handleDeleteSymptomLog}
          />
        )}

        {activeTab === 'account_settings' && (
          <AccountSettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 CareConnect AI India • ABHA & NDHM Integrated • 256-Bit Encrypted</p>
          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-600">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Clinical Service</span>
            <span>•</span>
            <span className="text-teal-700 font-bold">24/7 AI Triage Online</span>
          </div>
        </div>
      </footer>

      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />

      <LogSymptomModal
        isOpen={isLogSymptomOpen}
        onClose={() => setIsLogSymptomOpen(false)}
        onSaveSymptom={handleLogSymptom}
        currentCycleDay={cycleData.currentCycleDay}
      />

      <FloatingAIChat
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        onSendMessage={(text) => handleSendMessage(text)}
        isLoading={isAiLoading}
        userProfile={userProfile}
        onOpenFullChat={() => {
          setIsEmergencyOpen(false);
          setActiveTab('ai_chatbot');
        }}
      />
    </div>
  );
}
