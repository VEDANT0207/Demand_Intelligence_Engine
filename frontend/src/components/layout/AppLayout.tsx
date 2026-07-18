import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useStore } from '../../store/useStore';
import { AiAssistant } from '../ai/AiAssistant';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export const AppLayout: React.FC = () => {
  const { setApiStatus, aiAssistantOpen } = useStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get(`${API_URL}/health/`, { timeout: 3000 });
        if (response.data?.status === 'healthy') {
          setApiStatus('connected');
        } else {
          setApiStatus('offline');
        }
      } catch (error) {
        setApiStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, [setApiStatus, API_URL]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Workspace */}
        <main className="flex-1 h-full overflow-y-auto px-8 py-8 relative">
          <Outlet />
        </main>

        {/* Collapsible AI Assistant (Split View) */}
        <AnimatePresence>
          {aiAssistantOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '380px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="h-full border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden shadow-2xl relative z-20"
            >
              <div className="w-[380px] h-full flex flex-col">
                <AiAssistant />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
