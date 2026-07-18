import React from 'react';
import { Cpu, Database, Layers, CheckCircle2 } from 'lucide-react';

export const ModelInfo: React.FC = () => {
  return (
    <div className="space-y-6 text-left font-sans select-none animate-fade-in">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Model Documentation</h1>
        <p className="text-xs text-slate-500 mt-1">Underlying architecture, dataset definitions, and model evaluation metrics</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Model Info & Metrics (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section: Dataset Information */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
              <Database className="w-5 h-5 text-primary" />
              <span>Dataset & Ingestion Master</span>
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                The platform utilizes the historical **Rossmann Store Dataset** consisting of daily sales statistics across multiple stores. Features include store openings, holiday schedules, customer traffic footfalls, competitor metrics, and localized promos.
              </p>
              <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Historical Records</span>
                  <span className="font-extrabold text-slate-800 text-sm">1,017,209 Rows</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Store Classes</span>
                  <span className="font-extrabold text-slate-800 text-sm">4 Models (A, B, C, D)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Model Performance Metrics */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
              <Cpu className="w-5 h-5 text-secondary" />
              <span>XGBoost Forecasting Performance</span>
            </h2>
            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Parallel forecasting models are implemented separately for Sales predictions and Customer counts. Models are tuned using XGBoost Regressor estimators with custom grid parameters.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Sales Model */}
                <div className="p-4 border border-slate-150 rounded-xl bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs border-b border-slate-200/60 pb-1.5">Sales Model Metrics</span>
                  <div className="flex justify-between text-[11px] py-1 border-b border-slate-100/50">
                    <span className="text-slate-500">Root Mean Squared Error (RMSE)</span>
                    <span className="font-bold text-slate-800">421.2</span>
                  </div>
                  <div className="flex justify-between text-[11px] py-1 border-b border-slate-100/50">
                    <span className="text-slate-500">Mean Absolute Error (MAE)</span>
                    <span className="font-bold text-slate-800">289.4</span>
                  </div>
                  <div className="flex justify-between text-[11px] py-1">
                    <span className="text-slate-500">R-Squared Fit Ratio</span>
                    <span className="font-bold text-slate-800">0.965</span>
                  </div>
                </div>

                {/* Customer Model */}
                <div className="p-4 border border-slate-150 rounded-xl bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs border-b border-slate-200/60 pb-1.5">Customer Model Metrics</span>
                  <div className="flex justify-between text-[11px] py-1 border-b border-slate-100/50">
                    <span className="text-slate-500">Root Mean Squared Error (RMSE)</span>
                    <span className="font-bold text-slate-800">38.9</span>
                  </div>
                  <div className="flex justify-between text-[11px] py-1 border-b border-slate-100/50">
                    <span className="text-slate-500">Mean Absolute Error (MAE)</span>
                    <span className="font-bold text-slate-800">24.1</span>
                  </div>
                  <div className="flex justify-between text-[11px] py-1">
                    <span className="text-slate-500">R-Squared Fit Ratio</span>
                    <span className="font-bold text-slate-800">0.978</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Architecture & Technologies (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section: Project Architecture Diagram */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
              <Layers className="w-5 h-5 text-accent" />
              <span>Project Pipeline</span>
            </h2>
            
            <div className="space-y-4">
              {[
                { title: "Ingestion / Preprocessing", desc: "Aggregates raw CSV stores, fills missing values, and checks model columns." },
                { title: "Feature Engineering", desc: "Constructs date intervals, holiday lists, promo cycles, and competitor distances." },
                { title: "Recursive Forecasting", desc: "Runs rolling time-series calculations sequentially to model next-period actions." },
                { title: "Explainability / SHAP", desc: "Calculates variable contribution arrays (SHAP values) for output values." },
                { title: "LLM Advisory Summarizer", desc: "Translates predictions into actionable insights using Groq-llama model." }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-3 text-left">
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                    0{idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">{step.title}</span>
                    <span className="text-[10px] text-slate-550 block mt-0.5 leading-relaxed">{step.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Tech Stack Badges */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span>Technologies Stack</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {[
                "React 19", "Vite", "TypeScript", "TailwindCSS", "Recharts", "Zustand", "Supabase Auth",
                "FastAPI", "Python 3.11", "XGBoost", "SHAP", "Scikit-Learn", "Pandas", "Matplotlib"
              ].map((badge, idx) => (
                <span 
                  key={idx} 
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg shadow-sm hover:border-primary/20 hover:text-slate-900 transition-colors"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
