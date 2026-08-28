import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Paperclip, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Calendar, 
  ExternalLink, 
  Info,
  CheckCircle2,
  FileText,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ChatMessage, ChatSession, Provider, UserProfile } from '../types';
import { chatLanguages, detectChatLanguage, getChatLocale, getChatVoice, ChatLanguage } from '../services/chatLanguage';

interface AIChatbotViewProps {
  chatSessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onSendMessage: (text: string, attachments?: any[]) => Promise<void>;
  isLoading: boolean;
  onBookSpecialist: (specialtyOrName: string) => void;
  userProfile: UserProfile;
}

export const AIChatbotView: React.FC<AIChatbotViewProps> = ({
  chatSessions,
  currentSessionId,
  onSelectSession,
  onCreateNewSession,
  onDeleteSession,
  onSendMessage,
  isLoading,
  onBookSpecialist,
  userProfile,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voiceLanguage, setVoiceLanguage] = useState<ChatLanguage>('en');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentSession = chatSessions.find((s) => s.id === currentSessionId) || chatSessions[0];

  const starterPrompts = [
    { label: 'Throbbing headache on one side', query: 'I have a throbbing headache behind my left eye and sensitivity to light. What should I do?' },
    { label: 'Can I take Paracetamol with Amoxicillin?', query: 'Is it safe to take Paracetamol (Crocin/Dolo 650) for fever while currently prescribed Amoxicillin 500mg?' },
    { label: 'Luteal phase fatigue & sugar cravings', query: 'Why do I get intense fatigue and sugar cravings about 7 days before my menstrual period?' },
    { label: 'Find a neurologist in Kolkata', query: 'I need to consult a neurologist for recurring migraine headaches near Salt Lake or Park Street, Kolkata.' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isLoading]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachedFiles.length === 0) || isLoading) return;

    const textToSend = inputText;
    const filesToSend = [...attachedFiles];
    setInputText('');
    setAttachedFiles([]);
    await onSendMessage(textToSend, filesToSend);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFiles(prev => [...prev, { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` }]);
    }
  };

  // Text-To-Speech function
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const language = voiceLanguage;
      utterance.lang = getChatLocale(language);
      utterance.voice = getChatVoice(language) || null;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingMessageId(msgId);
    }
  };

  // Speech Recognition function
  const handleToggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getChatLocale(voiceLanguage);

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsRecording(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)] min-h-155 pb-4">
      
      {/* Left Sidebar: Conversations & Safety info */}
      <div className="lg:col-span-4 hidden md:flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-hidden">
        
        {/* New Chat Button */}
        <button
          id="new-chat-button"
          onClick={onCreateNewSession}
          className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-95 mb-4 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Clinical Conversation</span>
        </button>

        {/* Saved Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            Recent Health Consultations
          </p>

          {chatSessions.map((session) => {
            const isSelected = session.id === currentSessionId;
            return (
              <div
                key={session.id}
                id={`session-item-${session.id}`}
                onClick={() => onSelectSession(session.id)}
                className={`group p-3 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-2 border ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-200 text-teal-950 font-medium'
                    : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Bot className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                    <p className="text-xs font-bold truncate">{session.title}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {session.lastMessageSnippet || 'New conversation'}
                  </p>
                  <p className="text-[10px] text-slate-400">{session.createdAt}</p>
                </div>

                {chatSessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Safety & Triage Notice Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-2 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Clinical AI Guardrails</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            CareConnect AI processes symptoms using vetted clinical literature. Never ignores severe pain or emergency symptoms.
          </p>
        </div>

      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
        
        {/* Chat Top Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">CareConnect AI Assistant</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Educational Triage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              General Info Only
            </span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
          
          {/* Privacy Alert banner */}
          <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-3 text-xs text-teal-900 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <p className="leading-tight text-[11px]">
              <span className="font-bold">Encrypted Session:</span> Your clinical interactions are private and securely evaluated to help navigate symptoms and medical care.
            </p>
          </div>

          {/* Render Messages */}
          {currentSession?.messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                id={`chat-msg-${message.id}`}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-teal-600 text-white shadow-sm'
                }`}>
                  {isUser ? userProfile.fullName[0] : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : message.isEmergency
                      ? 'bg-red-50 text-red-950 border border-red-300 rounded-tl-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}>
                    
                    {/* Role header for assistant */}
                    {!isUser && (
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <span className="text-[11px] font-bold text-teal-700 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Clinical Health Synthesis
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleSpeak(message.id, message.content)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title={speakingMessageId === message.id ? 'Stop reading' : 'Read aloud'}
                          >
                            {speakingMessageId === message.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-teal-600" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Content formatted */}
                    <div className="whitespace-pre-line space-y-1">
                      {message.content}
                    </div>

                    {/* Attached files preview if any */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50 flex flex-wrap gap-1.5">
                        {message.attachments.map((att, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-500" />
                            {att.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Specialist Referral Card Action (if suggested) */}
                  {!isUser && message.suggestedSpecialist && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-teal-950">Recommended Action</p>
                        <p className="text-[11px] text-teal-800">
                          Schedule with: <span className="font-bold">{message.suggestedSpecialist}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => onBookSpecialist(message.suggestedSpecialist!)}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm whitespace-nowrap"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Book Slot</span>
                      </button>
                    </div>
                  )}

                  <div className={`text-[10px] text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>
                    {message.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating clinical guidance with Gemini...</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompts */}
        {(!currentSession?.messages || currentSession.messages.length <= 1) && (
          <div className="px-4 py-2 border-t border-slate-100 bg-white">
            <p className="text-[11px] font-bold text-slate-400 mb-1.5">Suggested Questions:</p>
            <div className="flex flex-wrap gap-1.5">
              {starterPrompts.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(sp.query)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 transition-colors"
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          
          {/* File attachment preview pill */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachedFiles.map((f, i) => (
                <div key={i} className="px-2 py-1 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-medium truncate max-w-37.5">{f.name}</span>
                  <span className="text-[10px] text-teal-600">({f.size})</span>
                  <button
                    onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-red-600 text-xs ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
            
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.txt"
            />

            {/* Attach button */}
            <button
              type="button"
              id="chat-attach-file-btn"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title="Attach photo or medical report"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Mic speech recognition button */}
            <select
              value={voiceLanguage}
              onChange={(event) => setVoiceLanguage(event.target.value as ChatLanguage)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-2 text-[11px] text-slate-600 outline-none focus:border-teal-500"
              aria-label="Voice language"
              title="Choose voice language"
            >
              {chatLanguages.map((language) => (
                <option key={language.code} value={language.code}>{language.label}</option>
              ))}
            </select>
            <button
              type="button"
              id="chat-mic-btn"
              onClick={handleToggleSpeechRecognition}
              className={`p-2.5 rounded-xl border transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              title={isRecording ? 'Stop recording' : 'Speak to AI'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                id="chat-input-textarea"
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e);
                  }
                }}
                placeholder="Ask about symptoms, medications, lab tests, or cycle trends..."
                className="w-full resize-none px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 max-h-32"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              id="chat-send-btn"
              disabled={(!inputText.trim() && attachedFiles.length === 0) || isLoading}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-teal-600/20 active:scale-95 shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>

          </form>
          
          <div className="mt-2 text-center">
            <span className="text-[10px] text-slate-400">
              CareConnect AI may make mistakes. Verify clinical decisions with a physician.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
