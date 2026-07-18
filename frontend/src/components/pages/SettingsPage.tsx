import React, { useState } from 'react';
import { User, Sliders, Shield, Info, Sparkles, Building } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const SettingsPage: React.FC = () => {
  const { session, apiStatus } = useStore();
  const [preferredStore, setPreferredStore] = useState<string>(
    localStorage.getItem('userPreferredStore') || '1'
  );

  const handleSavePreferredStore = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userPreferredStore', preferredStore);
    alert('Preferred store ID saved successfully!');
  };

  return (
    <div className="space-y-6 text-left font-sans select-none animate-fade-in">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure workspace metrics and manage account settings</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Main Settings Options (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section: Profile Information */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <User className="w-5 h-5 text-primary" />
              <span>Profile Information</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  disabled
                  value={session?.user?.user_metadata?.display_name || 'Admin User'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={session?.user?.email || 'admin@retail.com'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section: Preferred Store Management */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium animate-fade-in">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <Building className="w-5 h-5 text-primary" />
              <span>Preferred Store Configuration</span>
            </h2>

            <form onSubmit={handleSavePreferredStore} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Default Store ID</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min={1}
                    max={1115}
                    value={preferredStore}
                    onChange={(e) => setPreferredStore(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Save
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Enter the default store ID to automatically load forecast metrics on your enterprise dashboard upon login.
                </p>
              </div>
            </form>
          </div>

          {/* Section: Theme / Interface settings */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <Sliders className="w-5 h-5 text-secondary" />
              <span>Theme Preferences</span>
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-primary-light/30 border border-primary/10 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-primary-dark">
                  <span className="font-bold block">Aesthetics Locked</span>
                  <p className="mt-1 leading-relaxed text-[11px] text-slate-500">
                    This platform uses a **Premium Light Theme** optimized for clean, high-fidelity business dashboards (resembling Notion and Stripe). Dark mode is locked out to maintain cohesive reporting styling.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm cursor-not-allowed opacity-50"
                >
                  Light Mode (Locked)
                </button>
                <button
                  type="button"
                  disabled
                  className="px-4 py-2.5 bg-slate-50 border border-slate-100 text-slate-400 text-xs font-semibold rounded-xl cursor-not-allowed"
                >
                  Dark Mode
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: API status & Info (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section: API health and Version */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <Shield className="w-5 h-5 text-accent" />
              <span>Connection details</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="font-semibold text-slate-500">API Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                  apiStatus === 'connected' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-danger/10 text-danger'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'connected' ? 'bg-success animate-pulse' : 'bg-danger'}`}></span>
                  {apiStatus === 'connected' ? 'Connected' : 'Offline'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="font-semibold text-slate-500">FastAPI Host</span>
                <span className="font-bold text-slate-800 select-all">http://localhost:8000</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-slate-500">System Version</span>
                <span className="font-bold text-slate-800">1.0.0</span>
              </div>
            </div>
          </div>

          {/* Section: About Project */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
              <Info className="w-5 h-5 text-success" />
              <span>About Platform</span>
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              This system represents a production-grade Retail Demand Intelligence Platform designed to showcase enterprise ML pipelines with transparent SHAP explainers and context-aware natural language advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
