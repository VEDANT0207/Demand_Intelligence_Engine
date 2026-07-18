import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  UploadCloud, 
  Compass, 
  Cpu, 
  LineChart, 
  Users, 
  Layers3 
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" as any } }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden font-sans">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white shadow-premium">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Demand Intelligence</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-slate-900 transition-colors">Architecture</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">Workflow</a>
          </nav>

          <div className="flex items-center gap-4">
            {session ? (
              <Link 
                to="/dashboard" 
                className="py-2 px-4 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark shadow-sm transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="py-2.5 px-4 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark shadow-sm hover:shadow-premium transition-all flex items-center gap-1.5"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none z-0">
          <div className="absolute top-10 left-[10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-pulse [animation-duration:8s]"></div>
          <div className="absolute bottom-10 right-[10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] animate-pulse [animation-duration:12s]"></div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-12 gap-16 items-center relative z-10"
        >
          <div className="lg:col-span-7 text-left space-y-8">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-light border border-primary/10 rounded-full text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Forecasting Platform</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Retail Demand <br />
              <span className="gradient-text">Intelligence Platform</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-slate-500 max-w-xl leading-relaxed">
              AI-Powered Demand Forecasting and Business Intelligence System. Maximize operational performance, reduce inventory bloat, and unlock intelligent customer pathways using explainable XGBoost forecasting model predictions.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => navigate(session ? '/dashboard' : '/signup')} 
                className="py-3.5 px-6 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-dark active:transform active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-premium hover:shadow-premium-hover"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#features" 
                className="py-3.5 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all"
              >
                Learn More
              </a>
            </motion.div>
          </div>

          {/* Floating UI Widget Showcase */}
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-5 relative flex justify-center items-center"
          >
            <div className="relative w-full max-w-[420px] aspect-[4/3] bg-white border border-slate-100 rounded-2xl shadow-premium p-6 flex flex-col justify-between overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              {/* Widget Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Store #12 Forecast</span>
              </div>

              {/* Widget Main Info */}
              <div className="py-4 space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demand Volume</span>
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">84,923</span>
                    <span className="text-xs text-success font-semibold ml-1">+14.2% demand trend</span>
                  </div>
                  <div className="w-20 h-10 flex items-end gap-1">
                    <div className="w-full bg-primary/20 rounded-t-sm h-[30%]"></div>
                    <div className="w-full bg-primary/30 rounded-t-sm h-[50%]"></div>
                    <div className="w-full bg-primary/40 rounded-t-sm h-[40%]"></div>
                    <div className="w-full bg-primary/60 rounded-t-sm h-[70%]"></div>
                    <div className="w-full bg-primary rounded-t-sm h-[90%]"></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-success/10 text-success rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">AI Recommendation</span>
                    <span className="text-[11px] text-slate-500">Run promo code next Thursday to trigger +20% customer activity</span>
                  </div>
                </div>
              </div>

              {/* Floating micro-indicators */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-10 -right-6 bg-white border border-slate-100 rounded-xl shadow-premium px-4 py-2.5 flex items-center gap-2.5 scale-90"
              >
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-xs font-bold text-slate-800">Model accuracy 98.4%</span>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute bottom-10 -left-8 bg-white border border-slate-100 rounded-xl shadow-premium px-4 py-2.5 flex items-center gap-2.5 scale-90"
              >
                <div className="p-1 bg-accent/10 text-accent rounded">
                  <BrainCircuit className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-slate-800">SHAP explainability loaded</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-100 relative">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Powerful Intelligence Capabilities</h2>
          <p className="text-slate-500 text-sm">Everything you need to predict store sales, analyze customer actions, and configure smart decisions.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: TrendingUp,
              title: "Demand Forecasting",
              desc: "Predict sales and customer counts using recursive forecasting models trained on historical store data.",
              color: "text-primary bg-primary-light"
            },
            {
              icon: BrainCircuit,
              title: "Explainable AI (SHAP)",
              desc: "Deconstruct model variables. See exactly how school holidays, competition distance, or active promos drive outcomes.",
              color: "text-secondary bg-secondary-light"
            },
            {
              icon: Sparkles,
              title: "AI Advisor Chat",
              desc: "Speak with a retail specialist chat agent. Provide direct business context to receive intelligent operation tips.",
              color: "text-accent bg-accent-light"
            },
            {
              icon: UploadCloud,
              title: "Batch Predictions",
              desc: "Upload large CSV or Excel files. Process records through XGBoost models instantly and download results.",
              color: "text-success bg-success/10"
            },
            {
              icon: Compass,
              title: "Smart Recommendations",
              desc: "Receive actionable optimization steps for scheduling open hours, preparing promo events, and staff counts.",
              color: "text-warning bg-warning/10"
            },
            {
              icon: LineChart,
              title: "Business Intelligence",
              desc: "Interactive visual charts showcasing weekly sales timelines, distribution variances, and peak operation days.",
              color: "text-danger bg-danger/10"
            }
          ].map((feat, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${feat.color}`}>
                <feat.icon className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">{feat.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Animated System Architecture</h2>
            <p className="text-slate-500 text-sm">Explore the data pipeline flow from presentation layer down to the prediction engine.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6 text-left">
              <h3 className="text-xl font-bold text-slate-800">Production-Grade Processing Stack</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                The platform is constructed with a split layout interface connecting to a FastAPI microservice. Machine learning pipelines ingest historical CSV stores, engineer dates and promo indicators, run predictions, and pass metrics directly to explainability and LLM advisory blocks.
              </p>
              <div className="space-y-3">
                {[
                  "Optimized XGBoost models in pickle format",
                  "Explainable metrics generated via SHAP values",
                  "AI summary parsing with advanced natural language models"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col items-center gap-4">
              {[
                { title: "Presentation Layer", desc: "React Frontend with TypeScript, TailwindCSS, & Recharts", icon: Users },
                { title: "FastAPI Layer", desc: "Asynchronous API serving health, predictions, & chat routing", icon: Cpu },
                { title: "Prediction Engine", desc: "XGBoost models for Sales and Customer metrics", icon: Cpu },
                { title: "Business Intelligence Layer", desc: "Operational Intelligence Engine calculating trends & summaries", icon: LineChart },
                { title: "LLM Advisory Layer", desc: "AI Advisor summarizing SHAP results and business context", icon: Sparkles },
                { title: "Reporting Layer", desc: "Generate report endpoints, CSV downloads, and predictions", icon: Layers3 },
              ].map((layer, idx) => (
                <div key={idx} className="w-full max-w-[500px] flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl relative hover:border-primary/20 transition-colors">
                  {idx < 5 && (
                    <div className="absolute bottom-[-16px] left-[35px] w-0.5 h-4 bg-slate-200"></div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                      <layer.icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-900 block">{layer.title}</span>
                      <span className="text-[10px] text-slate-500">{layer.desc}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded">0{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Workflow</h2>
          <p className="text-slate-500 text-sm">From data collection to intelligent action, our workflow streamlines planning.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { step: "01", name: "Upload Data", desc: "Drag & drop files or inputs into the prediction workspace form." },
            { step: "02", name: "Predict", desc: "Machine learning models execute forecasts based on current configurations." },
            { step: "03", name: "Forecast", desc: "Generate sales and customer timeline trend metrics recursively." },
            { step: "04", name: "Analyze", desc: "Inspect SHAP explanations and peak activity summaries." },
            { step: "05", name: "Make Decisions", desc: "Use the AI Advisor to finalize inventory scheduling steps." },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 shadow-premium text-left relative flex flex-col justify-between">
              <span className="text-2xl font-black text-primary/10 tracking-tight mb-4 block">{item.step}</span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{item.name}</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-bg flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Demand Intelligence</span>
          </div>

          <p className="text-slate-400 text-xs">&copy; {new Date().getFullYear()} Retail Demand Intelligence Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
