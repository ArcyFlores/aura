
import React, { useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatAreaProps {
  messages: Message[];
  isThinking: boolean;
  isGenerating: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isThinking, isGenerating }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, isGenerating]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar relative"
    >
      {/* Processing Indicator (Distinct from thinking dots) */}
      {isGenerating && (
        <div className="sticky top-0 left-0 right-0 z-10 flex justify-center -mt-2 mb-4 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-blue-50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-300 aura-breathe"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold shimmer-text">
                Aura is reflecting
              </span>
            </div>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-blue-300">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-50">
            <p className="italic text-sm">"The world is quiet right now. How are you feeling in this moment?"</p>
          </div>
        </div>
      ) : (
        messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
          >
            <div 
              className={`max-w-[85%] px-5 py-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white text-blue-800 border border-blue-50 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))
      )}
      
      {isThinking && (
        <div className="flex justify-start animate-in fade-in duration-300">
          <div className="bg-white px-5 py-4 rounded-3xl rounded-bl-none shadow-sm border border-blue-50 flex gap-1">
            <span className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce delay-75"></span>
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
