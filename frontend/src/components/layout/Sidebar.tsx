import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  UploadCloud, 
  Sparkles, 
  BookOpen, 
  Settings, 
  LogOut
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { session, apiStatus, clearStore } = useStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearStore();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/prediction', label: 'Prediction', icon: TrendingUp },
    { to: '/batch-prediction', label: 'Batch Prediction', icon: UploadCloud },
    { to: '/model-info', label: 'Model Information', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white h-screen flex flex-col justify-between select-none">
      {/* Top Section */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2.5 mb-8 hover:opacity-85 transition-opacity block cursor-pointer">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white shadow-premium">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-slate-900 text-base tracking-tight">Demand Intel</span>
        </Link>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive 
                    ? 'bg-primary-light text-primary' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100 space-y-4">
        {/* API Status Indicator */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">API Status</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              apiStatus === 'connected' 
                ? 'bg-success animate-pulse' 
                : apiStatus === 'offline' 
                  ? 'bg-danger' 
                  : 'bg-warning animate-spin'
            }`}></span>
            <span className="text-[10px] font-bold text-slate-700">
              {apiStatus === 'connected' ? 'Connected' : apiStatus === 'offline' ? 'Offline' : 'Checking'}
            </span>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
              {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-800 block truncate">
                {session?.user?.user_metadata?.display_name || 'Admin User'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {session?.user?.email || 'admin@retail.com'}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
