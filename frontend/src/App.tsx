import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './components/auth/AuthPages';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './components/pages/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { PredictionWorkspace } from './components/prediction/PredictionWorkspace';
import { BatchPrediction } from './components/batch/BatchPrediction';
import { ModelInfo } from './components/pages/ModelInfo';
import { SettingsPage } from './components/pages/SettingsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const { setSession, setLoadingSession } = useStore();

  useEffect(() => {
    // Resolve session on load
    const resolveSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (err) {
        console.error('Error loading session:', err);
      } finally {
        setLoadingSession(false);
      }
    };

    resolveSession();

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingSession(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setLoadingSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected App Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/prediction" element={<PredictionWorkspace />} />
              <Route path="/batch-prediction" element={<BatchPrediction />} />
              <Route path="/explainability" element={<PredictionWorkspace />} />
              <Route path="/ai-workspace" element={<PredictionWorkspace />} />
              <Route path="/model-info" element={<ModelInfo />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Fallback inside app */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* Global Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
