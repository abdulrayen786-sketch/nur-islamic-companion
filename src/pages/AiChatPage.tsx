import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../services/api';
import { AudioService } from '../services/audioService';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Compass,
  Heart,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';

const SUGGESTED_TOPICS = [
  "Find verses about patience (Sabr) in trials",
  "Explain the meaning of Ayat al-Kursi (2:255)",
  "What are the benefits of reciting Surah Al-Kahf on Friday?",
  "How to attain more Khushu (focus) in prayer?",
  "Recommend authentic Duas for anxiety & distress",
  "Create a task: Read Surah Al-Mulk before sleep",
];

export const AiChatPage: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChatMessages,
    openQuranAt,
    setActiveSection,
    addNewTask,
    activeSection,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // Voice speech-to-text initialization
  const toggleSpeechRecognition = () => {
    if (isListeningSpeech) {
      recognitionRef.current?.stop();
      setIsListeningSpeech(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your message.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListeningSpeech(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListeningSpeech(false);
    };

    recognition.onerror = () => {
      setIsListeningSpeech(false);
    };

    recognition.onend = () => {
      setIsListeningSpeech(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage('');
    addChatMessage('user', query);
    setIsLoading(true);

    try {
      // Build conversation history format for API
      const conversationHistory = (chatMessages || []).slice(-10).map((m) => ({
        role: m.role,
        content: m.text || m.content || '',
      }));

      const res = await apiFetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: conversationHistory,
        }),
      });

      const data = await res.json();
      const assistantText = data.reply || data.text || "May Allah bless your seeking of beneficial knowledge.";
      const calls = (data.toolInvocations || data.toolCalls || []).map((c: any) => ({
        name: c.name || c.toolName,
        args: c.args || {},
      }));
      
      addChatMessage('assistant', assistantText, calls);

      // Handle any tool side effects
      if (Array.isArray(calls)) {
        for (const tc of calls) {
          if (tc.name === 'create_task' && (tc.args?.title || tc.args?.name)) {
            addNewTask(tc.args.title || tc.args.name, tc.args.category || 'Worship', tc.args.repeat || 'daily');
          }
        }
      }
    } catch (err) {
      console.error("AI chat error:", err);
      addChatMessage(
        'assistant',
        "Peace be upon you. I encountered a momentary connection difficulty. Please try your question again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakText = (id: string, text: string) => {
    if (speakingMessageId === id) {
      AudioService.stopSpeech();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(id);
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    AudioService.speakText(cleanText, 'en-US', () => {
      setSpeakingMessageId(null);
    });
  };

  const safeMessages = Array.isArray(chatMessages) ? chatMessages : [];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto pb-4">
      
      {/* Header Banner */}
      <div className="bg-[#0E1424] border border-amber-500/20 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-3 shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-display font-bold text-white">NUR AI Companion</h1>
              <span className="font-arabic text-amber-300 text-sm">نور الحكمة</span>
            </div>
            <p className="text-[11px] text-slate-400">Respectful Islamic guidance, Qur'anic discovery, and reflection</p>
          </div>
        </div>

        <button
          onClick={clearChatMessages}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
          title="Clear Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        
        {/* Scholar Safety Banner */}
        <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/80 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-amber-300">Educational Guidance: </span>
            NUR is designed for spiritual companionship, Qur'anic discovery, and reflection. For binding legal verdicts (Fatwas), please consult qualified traditional scholars.
          </p>
        </div>

        {/* Initial Empty State Prompts */}
        {safeMessages.length <= 1 && (
          <div className="p-6 rounded-3xl bg-[#0E1424]/60 border border-slate-800 text-center space-y-3 my-4">
            <Sparkles className="w-8 h-8 text-amber-400/60 mx-auto" />
            <h3 className="text-base font-display font-semibold text-white">How can NUR assist your spiritual journey today?</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Ask about Qur'an verses, prophetic supplications, fasting habits, or Islamic history.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-left">
              {SUGGESTED_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(topic)}
                  className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 hover:text-amber-200 transition-all flex items-center justify-between group"
                >
                  <span>{topic}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 group-hover:text-amber-400 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Items */}
        {safeMessages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSpeaking = speakingMessageId === msg.id;
          const messageText = msg.text || msg.content || '';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-amber-500 text-slate-950 font-display'
                    : 'bg-[#121A30] border border-amber-500/40 text-amber-300'
                }`}
              >
                {isUser ? 'You' : 'نور'}
              </div>

              {/* Message Box */}
              <div className={`space-y-2 max-w-[82%] sm:max-w-[75%]`}>
                <div
                  className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-sm shadow-md'
                      : 'bg-[#0E1424] border border-slate-800 text-slate-200 rounded-tl-sm shadow-lg'
                  }`}
                >
                  <p className="whitespace-pre-line">{messageText}</p>
                </div>

                {/* AI Tool Action Buttons & Interactive Cards */}
                {!isUser && msg.toolCalls && Array.isArray(msg.toolCalls) && msg.toolCalls.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {msg.toolCalls.map((tc, idx) => {
                      const toolName = tc.name;
                      const args = tc.args || {};
                      if (toolName === 'search_quran' || toolName === 'get_ayah_text') {
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="font-semibold text-amber-200">
                                {toolName === 'search_quran' ? `Search: "${args.query}"` : `Ayah ${args.surahNumber}:${args.ayahNumber}`}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (args.surahNumber) {
                                  openQuranAt(args.surahNumber, args.ayahNumber || 1);
                                } else {
                                  setActiveSection('quran');
                                }
                              }}
                              className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-semibold text-[11px] flex items-center gap-1 hover:bg-amber-400"
                            >
                              <span>Open in Qur'an</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      }

                      if (toolName === 'create_task') {
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="font-semibold text-emerald-200">
                                Task created: "{args.title || args.name}"
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveSection('tasks')}
                              className="text-[11px] text-emerald-300 underline font-medium"
                            >
                              View in Planner
                            </button>
                          </div>
                        );
                      }

                      if (toolName === 'open_section') {
                        const targetSec = args.section || args.sectionName;
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <span className="text-slate-300">Navigate to: <strong className="capitalize">{targetSec}</strong></span>
                            <button
                              onClick={() => setActiveSection(targetSec as any)}
                              className="px-3 py-1 rounded-xl bg-slate-800 text-amber-300 font-semibold text-[11px]"
                            >
                              Go to Section
                            </button>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}

                {/* Sub Action (Audio Read Aloud) */}
                {!isUser && (
                  <div className="flex items-center gap-2 pl-2">
                    <button
                      onClick={() => handleSpeakText(msg.id, msg.text)}
                      className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${
                        isSpeaking ? 'text-amber-300 animate-pulse' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isSpeaking ? <Volume2 className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? 'Reading Aloud...' : 'Read Aloud'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#121A30] border border-amber-500/40 text-amber-300 flex items-center justify-center text-xs font-bold">
              نور
            </div>
            <div className="p-4 rounded-3xl rounded-tl-sm bg-[#0E1424] border border-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-xs text-slate-400 ml-2">NUR is contemplating...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="mt-4 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListeningSpeech ? "Listening to your voice..." : "Ask NUR about Qur'an, Duas, prayers, or advice..."}
              className="w-full bg-[#0E1424] border border-slate-700/80 rounded-2xl pl-4 pr-12 py-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-xl"
            />

            {/* Voice Input Mic Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                isListeningSpeech
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="Speak your question"
            >
              {isListeningSpeech ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
