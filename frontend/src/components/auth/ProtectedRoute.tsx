import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export const ProtectedRoute: React.FC = () => {
  const { session, loadingSession } = useStore();

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1 left-1 w-14 h-14 border-4 border-secondary border-b-transparent rounded-full animate-spin [animation-duration:1.5s]"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
