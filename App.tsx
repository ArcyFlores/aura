
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReflectionCard from './components/ReflectionCard';
import ChatArea from './components/ChatArea';
import { generateDailyLandscape, getReflectiveResponse } from './services/geminiService';
import { startLiveSession, stopLiveSession } from './services/liveSessionService';
import { Message, ReflectionState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<ReflectionState>({
    dailyImageUrl: null,
    isGeneratingImage: true,
    messages: [],
    isThinking: false,
    isGenerating: false,
    isLive: false,
  });
  const [inputText, setInputText] = useState('');
  const [currentTranscription, setCurrentTranscription] = useState<{user: string, assistant: string}>({user: '', assistant: ''});

  useEffect(() => {
    const initApp = async () => {
      const url = await generateDailyLandscape();
      setState(prev => ({ 
        ...prev, 
        dailyImageUrl: url, 
        isGeneratingImage: false 
      }));
    };
    initApp();
  }, []);

  const handleSend = useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setInputText('');
    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, userMsg],
      isThinking: true,
      isGenerating: true
    }));

    const responseText = await getReflectiveResponse([...state.messages, userMsg]);
    
    const aiMsg: Message = {
      role: 'assistant',
      text: responseText,
      timestamp: new Date()
    };

    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, aiMsg],
      isThinking: false,
      isGenerating: false
    }));
  }, [inputText, state.messages]);

  const toggleLiveConversation = async () => {
    if (state.isLive) {
      stopLiveSession();
      setState(prev => ({ ...prev, isLive: false }));
    } else {
      try {
        await startLiveSession({
          onStateChange: (active) => {
            setState(prev => ({ ...prev, isLive: active }));
          },
          onTranscription: (text, role) => {
            setCurrentTranscription(prev => {
              const updated = { ...prev };
              if (role === 'user') updated.user += text;
              else updated.assistant += text;
              return updated;
            });
          },
          onError: (err) => {
            console.error("Live session error:", err);
            setState(prev => ({ ...prev, isLive: false }));
          }
        });

        // Clear transcriptions periodically to turn them into messages or just handle the flow
        // For Live API, we want a continuous feeling.
      } catch (err) {
        console.error("Failed to start live session:", err);
      }
    }
  };

  // Sync transcription to message history when a "turn" seems complete or periodically
  useEffect(() => {
    if (!state.isLive) {
      if (currentTranscription.user || currentTranscription.assistant) {
        const newMsgs: Message[] = [];
        if (currentTranscription.user) {
          newMsgs.push({ role: 'user', text: currentTranscription.user, timestamp: new Date() });
        }
        if (currentTranscription.assistant) {
          newMsgs.push({ role: 'assistant', text: currentTranscription.assistant, timestamp: new Date() });
        }
        if (newMsgs.length > 0) {
          setState(prev => ({ ...prev, messages: [...prev.messages, ...newMsgs] }));
        }
        setCurrentTranscription({ user: '', assistant: '' });
      }
    }
  }, [state.isLive]);

  const downloadImage = () => {
    if (!state.dailyImageUrl) return;
    const link = document.createElement('a');
    link.href = state.dailyImageUrl;
    link.download = `aura-reflection-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f7ff] text-blue-900 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center shadow-md">
            <i className="fa-solid fa-feather-pointed text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-blue-800">Aura</h1>
        </div>
        <div className="flex items-center gap-3">
          {state.isLive && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 rounded-full animate-pulse">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest">Live</span>
            </div>
          )}
          <div className="text-xs text-blue-400 bg-white/50 px-3 py-1 rounded-full border border-blue-100">
            Daily Ritual
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full max-w-lg mx-auto overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="px-6 pt-2 pb-6">
            <ReflectionCard 
              imageUrl={state.dailyImageUrl} 
              isLoading={state.isGeneratingImage}
              onDownload={downloadImage}
            />
          </div>

          <ChatArea 
            messages={state.messages} 
            isThinking={state.isThinking} 
            isGenerating={state.isGenerating || state.isLive}
          />

          {/* Real-time transcription overlay if active */}
          {state.isLive && (currentTranscription.user || currentTranscription.assistant) && (
            <div className="px-6 pb-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-blue-100 text-sm text-blue-800 italic">
                {currentTranscription.user && <p className="mb-2">You: {currentTranscription.user}</p>}
                {currentTranscription.assistant && <p className="text-blue-500">Aura: {currentTranscription.assistant}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Persistent Input Controls */}
        <div className="p-4 bg-white/40 backdrop-blur-xl border-t border-blue-50">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <button 
              onClick={toggleLiveConversation}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                state.isLive 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-white text-blue-400 border border-blue-100 hover:border-blue-300'
              }`}
              title={state.isLive ? "End conversation" : "Start Live Session"}
            >
              <i className={`fa-solid ${state.isLive ? 'fa-stop' : 'fa-microphone-lines'}`}></i>
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                disabled={state.isLive}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={state.isLive ? "Listening to your voice..." : "Write a thought..."}
                className="w-full bg-white border border-blue-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm transition-all disabled:bg-blue-50/50 disabled:cursor-not-allowed"
              />
              {!state.isLive && (
                <button 
                  onClick={() => handleSend()}
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1.5 w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-30 disabled:scale-95 transition-all shadow-md active:scale-90"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] text-center text-blue-300 mt-2 font-medium tracking-wide">
            {state.isLive ? "Aura is listening to your voice. Speak freely." : "A safe space for your heart to speak."}
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
