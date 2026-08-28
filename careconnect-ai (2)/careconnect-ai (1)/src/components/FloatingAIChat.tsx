import React, { useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, HeartPulse, Mic, MicOff, Send, Volume2, VolumeX, X } from 'lucide-react';
import { ChatSession, UserProfile } from '../types';
import { chatLanguages, detectChatLanguage, getChatLocale, getChatVoice, ChatLanguage } from '../services/chatLanguage';

interface FloatingAIChatProps {
  chatSessions: ChatSession[];
  currentSessionId: string;
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  userProfile: UserProfile;
  onOpenFullChat: () => void;
}

export const FloatingAIChat: React.FC<FloatingAIChatProps> = ({
  chatSessions,
  currentSessionId,
  onSendMessage,
  isLoading,
  userProfile,
  onOpenFullChat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<ChatLanguage>('en');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pendingVoiceResponse = useRef(false);

  const currentSession = chatSessions.find((session) => session.id === currentSessionId) || chatSessions[0];
  const messages = currentSession?.messages || [];

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    const latestAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
    if (!pendingVoiceResponse.current || isLoading || !latestAssistant || !('speechSynthesis' in window)) return;

    pendingVoiceResponse.current = false;
    window.speechSynthesis.cancel();
    const cleanText = latestAssistant.content.replace(/[*#_]/g, '');
    const language = voiceLanguage;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = getChatLocale(language);
    utterance.voice = getChatVoice(language) || null;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, [messages, isLoading]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = inputText.trim();
    if (!message || isLoading) return;
    setInputText('');
    pendingVoiceResponse.current = true;
    await onSendMessage(message);
  };

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      window.alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = getChatLocale(voiceLanguage);
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      setInputText((previous) => previous ? `${previous} ${transcript}` : transcript);
      window.setTimeout(() => {
        setInputText((current) => {
          const message = current.trim();
          if (message && !isLoading) {
            pendingVoiceResponse.current = true;
            void onSendMessage(message);
            return '';
          }
          return current;
        });
      }, 500);
    };
    recognition.start();
  };

  const speakLatest = () => {
    const latestAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
    if (!latestAssistant || !('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const cleanText = latestAssistant.content.replace(/[*#_]/g, '');
    const language = voiceLanguage;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = getChatLocale(language);
    utterance.voice = getChatVoice(language) || null;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <section className="w-[min(92vw,380px)] h-[min(70vh,560px)] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col" aria-label="CareConnect AI chat">
          <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center"><HeartPulse className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-bold">CareConnect AI</p>
                <p className="text-[10px] text-slate-300">Symptoms, food, and specialist guidance</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10" title="Close AI assistant" aria-label="Close AI assistant"><X className="w-4 h-4" /></button>
          </header>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-3 space-y-3">
            <div className="rounded-xl border border-teal-100 bg-teal-50 p-3 text-[11px] leading-relaxed text-teal-950">
              Tell me your symptoms, how long you have had them, and what you have eaten or taken. I can suggest self-care, foods, warning signs, and the type of doctor to consider. I do not diagnose.
            </div>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed whitespace-pre-line ${message.role === 'user' ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-[11px] text-teal-700 font-semibold animate-pulse">Reviewing your health question...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-3 shrink-0">
            <form onSubmit={submit} className="flex items-end gap-1.5">
              <select
                value={voiceLanguage}
                onChange={(event) => setVoiceLanguage(event.target.value as ChatLanguage)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-2 text-[10px] text-slate-600 outline-none focus:border-teal-500"
                aria-label="Voice language"
                title="Choose voice language"
              >
                {chatLanguages.map((language) => (
                  <option key={language.code} value={language.code}>{language.label}</option>
                ))}
              </select>
              <button type="button" onClick={toggleRecording} className={`p-2.5 rounded-xl border ${isRecording ? 'bg-red-500 text-white border-red-500' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`} title={isRecording ? 'Stop voice input' : 'Speak your question'} aria-label={isRecording ? 'Stop voice input' : 'Speak your question'}>
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <textarea value={inputText} onChange={(event) => setInputText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(event); } }} rows={1} placeholder="Describe your symptoms..." className="min-w-0 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <button type="submit" disabled={!inputText.trim() || isLoading} className="p-2.5 rounded-xl bg-teal-600 text-white disabled:opacity-40" title="Send question" aria-label="Send question"><Send className="w-4 h-4" /></button>
            </form>
            <div className="mt-2 flex items-center justify-between">
              <button type="button" onClick={speakLatest} disabled={!messages.some((message) => message.role === 'assistant')} className="text-[10px] text-slate-500 hover:text-teal-700 disabled:opacity-40 flex items-center gap-1" title={speaking ? 'Stop reading response' : 'Read latest response aloud'}>
                {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />} {speaking ? 'Stop voice' : 'Read response'}
              </button>
              <button type="button" onClick={onOpenFullChat} className="text-[10px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1">Full consultation <ChevronDown className="w-3 h-3 -rotate-90" /></button>
            </div>
          </div>
        </section>
      )}

      {!isOpen && (
        <button type="button" onClick={() => setIsOpen(true)} className="w-14 h-14 rounded-full bg-teal-600 text-white shadow-xl shadow-teal-900/20 flex items-center justify-center hover:bg-teal-700 hover:scale-105 transition-transform" title="Open AI health assistant" aria-label="Open AI health assistant">
          <HeartPulse className="w-7 h-7" />
        </button>
      )}
    </div>
  );
};
