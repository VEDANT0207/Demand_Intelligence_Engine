import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import axios from 'axios';

export const AiAssistant: React.FC = () => {
  const { 
    chatHistory, 
    addChatMessage, 
    clearChatHistory, 
    latestBusinessContext, 
    setAiAssistantOpen 
  } = useStore();
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      role: 'user' as const,
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addChatMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      // Send chat request
      const response = await axios.post(`${API_URL}/chat/`, {
        business_context: latestBusinessContext || {},
        question: textToSend,
      });

      const assistantMsg = {
        role: 'assistant' as const,
        content: response.data?.response || response.data || 'No response returned from the advisor.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      addChatMessage(assistantMsg);
    } catch (err: any) {
      const errorMsg = {
        role: 'assistant' as const,
        content: '⚠️ Failed to connect to AI Advisor. Please verify that the backend server is running and healthy.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addChatMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const triggerQuickAction = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">AI Operations Advisor</h3>
            <p className="text-[10px] text-slate-400">Context-Aware Chat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChatHistory}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-150 transition-all"
            title="Clear Chat History"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setAiAssistantOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-150 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Badge */}
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Context</span>
        {latestBusinessContext ? (
          <span className="text-[9px] font-semibold text-success bg-success/15 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
            Store Data Loaded
          </span>
        ) : (
          <span className="text-[9px] font-semibold text-warning bg-warning/15 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            No Active Context
          </span>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center px-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-sm">
              <Bot className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700">How can I assist you?</h4>
              <p className="text-[11px] text-slate-400 max-w-[240px]">
                I can summarize models, review promo outcomes, explain forecasting curves, and offer supply tips.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="w-full pt-4 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-left mb-1.5">Quick Prompts</span>
              <button 
                onClick={() => triggerQuickAction("✨ Generate AI Summary of the latest results")}
                disabled={!latestBusinessContext}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>✨</span> Generate AI Summary
              </button>
              <button 
                onClick={() => triggerQuickAction("📈 Explain this forecast and operational impact")}
                disabled={!latestBusinessContext}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>💬</span> Explain This Forecast
              </button>
              <button 
                onClick={() => triggerQuickAction("🧠 Why was this recommendation suggested? Explain primary drivers.")}
                disabled={!latestBusinessContext}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>💡</span> Why This Recommendation?
              </button>
            </div>
          </div>
        ) : (
          chatHistory.map((msg, i) => (
            <div 
              key={i} 
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
              }`}>
                <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                <span className={`text-[8px] mt-1 block text-right ${
                  msg.role === 'user' ? 'text-primary-light' : 'text-slate-400'
                }`}>{msg.timestamp}</span>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none border border-slate-200/50 px-3.5 py-2.5 text-xs flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-[10px] text-slate-400 italic">Advisor is compiling insights...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={latestBusinessContext ? "Ask about this prediction..." : "Predict sales to unlock chat..."}
            className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none placeholder-slate-400 py-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-35 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
