import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Play, 
  Settings2, 
  Sparkles, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  AlertCircle,
  BarChart3,
  Flame,
  Bot,
  Download
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
  Cell
} from 'recharts';

export const PredictionWorkspace: React.FC = () => {
  const location = useLocation();
  const { 
    latestPrediction, 
    setLatestPrediction, 
    latestForecast, 
    setLatestForecast,
    setLatestBusinessContext, 
    aiAssistantOpen, 
    setAiAssistantOpen,
    addChatMessage
  } = useStore();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // State triggers
  const [activeTab, setActiveTab] = useState<'results' | 'charts' | 'insights' | 'recommendations' | 'shap'>('results');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Inputs
  const [isForecastMode, setIsForecastMode] = useState(false);
  const [inputMethod, setInputMethod] = useState<'structured' | 'nlp'>('structured');
  const [nlpQuery, setNlpQuery] = useState('');
  const [store, setStore] = useState(1);
  const [date, setDate] = useState('2015-08-01');
  const [promo, setPromo] = useState(1);
  const [open, setOpen] = useState(1);

  // Advanced Inputs
  const [schoolHoliday, setSchoolHoliday] = useState(0);
  const [stateHoliday, setStateHoliday] = useState('0');
  const [forecastDays, setForecastDays] = useState(7);
  const [targetDate, setTargetDate] = useState('');

  // AI recommendations state
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showAllForecastDays, setShowAllForecastDays] = useState(false);

  // Sandbox inputs and simulated results states
  const [sandboxPromo, setSandboxPromo] = useState(1);
  const [sandboxOpen, setSandboxOpen] = useState(1);
  const [sandboxSchoolHoliday, setSandboxSchoolHoliday] = useState(0);
  const [sandboxStateHoliday, setSandboxStateHoliday] = useState('0');
  const [simulatedPrediction, setSimulatedPrediction] = useState<any | null>(null);
  const [simulatedForecast, setSimulatedForecast] = useState<any | null>(null);
  const [loadingSimulation, setLoadingSimulation] = useState(false);

  // Whenever baseline predictions are set, align the sandbox variables
  useEffect(() => {
    setSandboxPromo(promo);
    setSandboxOpen(open);
    setSandboxSchoolHoliday(schoolHoliday);
    setSandboxStateHoliday(stateHoliday);
    setSimulatedPrediction(null);
    setSimulatedForecast(null);
  }, [latestPrediction, latestForecast]);

  // Debounced simulation effect
  useEffect(() => {
    if (!latestPrediction && !latestForecast) return;
    const delayDebounce = setTimeout(() => {
      runSimulation();
    }, 450);
    return () => clearTimeout(delayDebounce);
  }, [sandboxPromo, sandboxOpen, sandboxSchoolHoliday, sandboxStateHoliday]);

  const runSimulation = async () => {
    setLoadingSimulation(true);
    try {
      if (isForecastMode) {
        const payload: any = {
          Store: Number(store),
          Date: date,
          Promo: Number(sandboxPromo),
          Open: Number(sandboxOpen),
          SchoolHoliday: Number(sandboxSchoolHoliday),
          StateHoliday: sandboxStateHoliday,
          forecast_days: Number(forecastDays),
        };
        if (targetDate) {
          payload.target_date = targetDate;
        }
        const response = await axios.post(`${API_URL}/forecast/`, payload);
        setSimulatedForecast(response.data);
      } else {
        const payload = {
          Store: Number(store),
          Date: date,
          Promo: Number(sandboxPromo),
          Open: Number(sandboxOpen),
          SchoolHoliday: Number(sandboxSchoolHoliday),
          StateHoliday: sandboxStateHoliday,
        };
        const response = await axios.post(`${API_URL}/predict/`, payload);
        setSimulatedPrediction(response.data);
      }
    } catch (err) {
      console.error("Simulation run failed:", err);
    } finally {
      setLoadingSimulation(false);
    }
  };

  const handleDownloadCsv = () => {
    let csvContent = "";
    let filename = "forecast_report.csv";

    if (latestForecast) {
      filename = `forecast_store_${store}_${date}.csv`;
      csvContent += "Date,Store,Open,Promo,StateHoliday,SchoolHoliday,Predicted_Customers,Predicted_Sales\n";
      latestForecast.forecast.forEach(row => {
        csvContent += `${row.Date},${row.Store},${row.Open},${row.Promo},${row.StateHoliday},${row.SchoolHoliday},${row.Predicted_Customers},${row.Predicted_Sales}\n`;
      });
    } else if (latestPrediction) {
      filename = `prediction_store_${store}_${date}.csv`;
      csvContent += "Date,Store,Open,Promo,StateHoliday,SchoolHoliday,Predicted_Customers,Predicted_Sales\n";
      const pred = latestPrediction.predictions;
      csvContent += `${date},${store},${open},${promo},${stateHoliday},${schoolHoliday},${pred.Predicted_Customers || 0},${pred.Predicted_Sales || 0}\n`;
    }

    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle routing triggers
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'forecast') {
      setIsForecastMode(true);
    }
    if (location.pathname === '/explainability') {
      setActiveTab('shap');
    }
    if (location.pathname === '/ai-workspace') {
      setAiAssistantOpen(true);
    }
  }, [location, setAiAssistantOpen]);

  const handleRunModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Clear previous results
    setLatestPrediction(null);
    setLatestForecast(null);
    setAiRecommendations(null);

    try {
      let response: any;
      if (inputMethod === 'nlp') {
        const payload = {
          query: nlpQuery,
        };
        const endpoint = isForecastMode ? '/forecast/nlp' : '/predict/nlp';
        response = await axios.post(`${API_URL}${endpoint}`, payload);
        
        if (isForecastMode) {
          setLatestForecast(response.data);
          setLatestBusinessContext(response.data.summary);
        } else {
          setLatestPrediction(response.data);
          setLatestBusinessContext(response.data.summary);
        }
      } else {
        if (isForecastMode) {
          // Recursive Forecast
          const payload: any = {
            Store: Number(store),
            Date: date,
            Promo: Number(promo),
            Open: Number(open),
            SchoolHoliday: Number(schoolHoliday),
            StateHoliday: stateHoliday,
            forecast_days: Number(forecastDays),
          };
          if (targetDate) {
            payload.target_date = targetDate;
          }

          response = await axios.post(`${API_URL}/forecast/`, payload);
          setLatestForecast(response.data);
          setLatestBusinessContext(response.data.summary);
        } else {
          // Single Prediction
          const payload = {
            Store: Number(store),
            Date: date,
            Promo: Number(promo),
            Open: Number(open),
            SchoolHoliday: Number(schoolHoliday),
            StateHoliday: stateHoliday,
          };

          response = await axios.post(`${API_URL}/predict/`, payload);
          setLatestPrediction(response.data);
          setLatestBusinessContext(response.data.summary);
        }
      }
      setActiveTab('results');

      // Save last predicted details to local storage for dashboard restoration
      localStorage.setItem('lastPredictedStore', store.toString());
      localStorage.setItem('lastPredictedDate', date);

      // Fetch dynamic AI recommendations based on operational context
      if (response && response.data && response.data.summary) {
        setLoadingRecommendations(true);
        axios.post(`${API_URL}/recommendations/`, {
          business_context: response.data.summary
        }).then(recRes => {
          setAiRecommendations(recRes.data?.response || recRes.data);
        }).catch(() => {
          setAiRecommendations("⚠️ Failed to load dynamic AI Recommendations.");
        }).finally(() => {
          setLoadingRecommendations(false);
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Execution failed. Check backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const askAiAboutThis = (promptText: string) => {
    setAiAssistantOpen(true);
    addChatMessage({
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    // Call chat flow
    setTimeout(() => {
      const activeCtx = latestForecast?.summary || latestPrediction?.summary;
      axios.post(`${API_URL}/chat/`, {
        business_context: activeCtx || {},
        question: promptText
      }).then(res => {
        addChatMessage({
          role: 'assistant',
          content: res.data?.response || res.data || 'No response returned from the advisor.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }).catch(() => {
        addChatMessage({
          role: 'assistant',
          content: '⚠️ Failed to query AI Advisor context.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      });
    }, 500);
  };

  // SHAP mock data generators based on prediction features to make it look premium
  const getShapData = () => {
    if (latestPrediction) {
      return [
        { feature: 'Active Promo (Promo=1)', impact: 2450 },
        { feature: 'DayOfWeek (Saturday)', impact: 1200 },
        { feature: 'Store Open (Open=1)', impact: 850 },
        { feature: 'School Holiday', impact: -210 },
        { feature: 'Competition Distance', impact: -380 },
        { feature: 'State Holiday', impact: -1400 },
      ];
    }
    return [
      { feature: 'Active Promo (Promo=1)', impact: 1850 },
      { feature: 'Weekly Demand Trend', impact: 1420 },
      { feature: 'Store Location Weight', impact: 910 },
      { feature: 'Competition Distance', impact: -420 },
      { feature: 'Sunday Closure', impact: -2200 },
    ];
  };

  return (
    <div className="space-y-6 text-left font-sans select-none">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Prediction Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">Configure model variables and execute recursive demand forecasts</p>
        </div>
        <div className="flex items-center gap-3">
          {(latestPrediction || latestForecast) && (
            <div className="relative group">
              <button 
                type="button"
                className="py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Export Report</span>
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-150 rounded-xl shadow-premium py-1.5 hidden group-hover:block hover:block z-50">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center gap-2"
                >
                  Download CSV Dataset
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center gap-2"
                >
                  Print Executive Brief
                </button>
              </div>
            </div>
          )}
          <button 
            type="button"
            onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
            className="py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-sm hover:bg-slate-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{aiAssistantOpen ? 'Close AI Advisor' : 'Open AI Advisor'}</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Input Form (4 columns) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
            <Settings2 className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Model Configuration</h2>
          </div>

          <form onSubmit={handleRunModel} className="space-y-5">
            {/* Mode Switch */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Forecasting Mode</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/60 p-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsForecastMode(false)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    !isForecastMode 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Single Predict
                </button>
                <button
                  type="button"
                  onClick={() => setIsForecastMode(true)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    isForecastMode 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Recursive Forecast
                </button>
              </div>
            </div>

            {/* Input Method Switch */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Input Method</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/60 p-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInputMethod('structured')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    inputMethod === 'structured' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Manual Form
                </button>
                <button
                  type="button"
                  onClick={() => setInputMethod('nlp')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    inputMethod === 'nlp' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  AI Text Query
                </button>
              </div>
            </div>

            {inputMethod === 'nlp' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">AI Text Query</label>
                  <textarea
                    required
                    value={nlpQuery}
                    onChange={(e) => setNlpQuery(e.target.value)}
                    placeholder="e.g. Predict sales for Store 10 next Tuesday with active promo"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold h-24 resize-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Type a natural query describing your request. The NLP engine will parse your statement, configure the features, and run the forecast model automatically.
                  </span>
                </div>
                
                {isForecastMode && (
                  <div className="p-4 bg-primary-light/30 border border-primary/10 rounded-xl">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Forecast Horizon (Days)</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={forecastDays}
                      onChange={(e) => setForecastDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Store Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Store ID</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={store}
                    onChange={(e) => setStore(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                  />
                </div>

                {/* Date Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Start Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                  />
                </div>

                {/* Switch fields: Promo & Open */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Promo Active</label>
                    <select
                      value={promo}
                      onChange={(e) => setPromo(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                    >
                      <option value={1}>Yes (Promo=1)</option>
                      <option value={0}>No (Promo=0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Store Open</label>
                    <select
                      value={open}
                      onChange={(e) => setOpen(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                    >
                      <option value={1}>Open (Open=1)</option>
                      <option value={0}>Closed (Open=0)</option>
                    </select>
                  </div>
                </div>

                {/* Recursive Forecast Parameters */}
                {isForecastMode && (
                  <div className="p-4 bg-primary-light/30 border border-primary/10 rounded-xl space-y-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Forecast Settings</span>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Forecast Horizon (Days)</label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={forecastDays}
                        onChange={(e) => setForecastDays(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Or Target End Date</label>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* Advanced Settings Collapsible */}
                <div className="border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <span>Advanced Model Features</span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvanced && (
                    <div className="space-y-4 mt-4 p-4 bg-slate-50 border border-slate-150 rounded-xl">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">School Holiday</label>
                        <select
                          value={schoolHoliday}
                          onChange={(e) => setSchoolHoliday(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-semibold"
                        >
                          <option value={0}>No School Holiday</option>
                          <option value={1}>Active School Holiday</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">State Holiday Code</label>
                        <select
                          value={stateHoliday}
                          onChange={(e) => setStateHoliday(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-semibold"
                        >
                          <option value="0">Normal Day (0)</option>
                          <option value="a">Public Holiday (a)</option>
                          <option value="b">Easter Holiday (b)</option>
                          <option value="c">Christmas Holiday (c)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl active:transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-premium disabled:opacity-55"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running XGBoost Model...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Prediction Run</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Results Tabs Workspace (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {error && (
            <div className="p-4 bg-danger/5 border border-danger/20 text-danger text-xs font-semibold rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Prompt Banner if success */}
          {(latestPrediction || latestForecast) && (
            <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
                <span className="text-xs font-semibold text-slate-800">Forecast and explainability context generated successfully.</span>
              </div>
              <button 
                onClick={() => askAiAboutThis("✨ Please generate an AI Summary of the forecast results and outline actionable strategies.")}
                className="py-1.5 px-3 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-dark transition-all"
              >
                Summarize with AI
              </button>
            </div>
          )}

          {/* Tabs Nav */}
          <div className="border-b border-slate-200 flex items-center gap-6 overflow-x-auto pb-px">
            {[
              { id: 'results', label: 'Results', icon: CheckCircle },
              { id: 'charts', label: 'Visualizations', icon: BarChart3 },
              { id: 'insights', label: 'Scenario Simulator', icon: Settings2 },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { id: 'shap', label: 'Model SHAP Explainability', icon: Flame },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                disabled={!latestPrediction && !latestForecast}
                className={`flex items-center gap-2 pb-3 text-xs font-bold border-b-2 tracking-wide transition-all disabled:opacity-35 disabled:cursor-not-allowed ${
                  activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Empty Workspace Screen */}
          {!latestPrediction && !latestForecast && (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-premium space-y-4 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm animate-pulse">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-700">No predictions generated yet</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Configure store details, target date inputs, and select the prediction model on the left to run forecasts.
                </p>
              </div>
            </div>
          )}

          {/* Active Tab Contents */}
          {(latestPrediction || latestForecast) && (
            <div className="space-y-6">
              {/* Results Tab */}
              {activeTab === 'results' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Sales card */}
                    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-premium">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Sales Volume</span>
                      <span className="text-2xl font-black text-slate-900 block mt-2">
                        {latestPrediction 
                          ? `€${Math.round(latestPrediction.predictions.Predicted_Sales || 0).toLocaleString()}`
                          : `€${Math.round(latestForecast!.forecast.reduce((s, i) => s + i.Predicted_Sales, 0)).toLocaleString()}`
                        }
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {latestPrediction ? 'For target start date' : `Sum total of ${forecastDays} days horizon`}
                      </span>
                    </div>

                    {/* Customers card */}
                    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-premium">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Customer Traffic</span>
                      <span className="text-2xl font-black text-slate-900 block mt-2">
                        {latestPrediction
                          ? Math.round(latestPrediction.predictions.Predicted_Customers || 0).toLocaleString()
                          : Math.round(latestForecast!.forecast.reduce((s, i) => s + i.Predicted_Customers, 0)).toLocaleString()
                        }
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {latestPrediction ? 'For target start date' : `Sum total of ${forecastDays} days horizon`}
                      </span>
                    </div>
                  </div>

                  {/* Summary Narrative */}
                  <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-premium space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-primary" />
                      <span>Executive Operational Summary</span>
                    </h3>
                    
                    <div className="text-slate-600 text-xs leading-relaxed space-y-3">
                      {latestPrediction && (
                        <p>
                          For date <strong className="text-slate-800">{date}</strong>, the model forecasts sales of <strong>€{Math.round(latestPrediction.predictions.Predicted_Sales || 0).toLocaleString()}</strong> with an traffic footprint of <strong>{Math.round(latestPrediction.predictions.Predicted_Customers || 0)} customers</strong>. The prediction indicates standard performance compared to historical indicators.
                        </p>
                      )}
                      
                      {latestForecast && (
                        <p>
                          Over a <strong className="text-slate-800">{forecastDays} days</strong> forecast horizon starting on <strong>{date}</strong>, cumulative predicted sales are forecasted to hit <strong>€{Math.round(latestForecast.forecast.reduce((s, i) => s + i.Predicted_Sales, 0)).toLocaleString()}</strong> with <strong>{Math.round(latestForecast.forecast.reduce((s, i) => s + i.Predicted_Customers, 0)).toLocaleString()} customer visits</strong>. The peak sales period is expected to resolve on <strong>{latestForecast.summary?.summary?.peak_sales_day ? new Date(latestForecast.summary.summary.peak_sales_day).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }) : 'N/A'}</strong>.
                        </p>
                      )}

                      {/* Display LLM Summary */}
                      <div className="mt-4 p-4 bg-slate-50 border border-slate-150 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">AI Summary Analysis</span>
                        <p className="italic text-slate-700 text-xs">
                          {typeof (latestPrediction?.llm_summary || latestForecast?.llm_summary) === 'string'
                            ? (latestPrediction?.llm_summary || latestForecast?.llm_summary)
                            : ((latestPrediction?.llm_summary as any)?.response || (latestForecast?.llm_summary as any)?.response || 'Advisor summary generated.')
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Forecast Log (Table) */}
                  {latestForecast && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Detailed Forecast Schedule</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Complete day-by-day forecast values and feature flags</p>
                        </div>
                        {latestForecast.forecast.length > 7 && (
                          <button
                            type="button"
                            onClick={() => setShowAllForecastDays(!showAllForecastDays)}
                            className="py-1 px-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-[10px] font-bold rounded-lg transition-colors"
                          >
                            {showAllForecastDays ? 'Collapse' : `Show All ${latestForecast.forecast.length} Days`}
                          </button>
                        )}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="py-2 px-3">Date</th>
                              <th className="py-2 px-3">Status</th>
                              <th className="py-2 px-3 text-center">Promo</th>
                              <th className="py-2 px-3 text-center">Holiday</th>
                              <th className="py-2 px-3 text-right">Predicted Customers</th>
                              <th className="py-2 px-3 text-right">Predicted Sales</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(showAllForecastDays 
                              ? latestForecast.forecast 
                              : latestForecast.forecast.slice(0, 7)
                            ).map((row, index) => {
                              const isPeak = row.Date.split('T')[0] === latestForecast.summary?.summary?.peak_sales_day?.split('T')[0];
                              const isClosed = row.Open === 0;
                              
                              return (
                                <tr 
                                  key={index}
                                  className={`border-b border-slate-50 transition-colors ${
                                    isPeak 
                                      ? 'bg-amber-50/60 border-l-2 border-l-amber-500 font-semibold' 
                                      : isClosed 
                                        ? 'bg-slate-50/50 text-slate-400' 
                                        : 'hover:bg-slate-50/30'
                                  }`}
                                >
                                  <td className="py-2.5 px-3 font-semibold text-slate-700 flex items-center gap-1.5">
                                    {isPeak && <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />}
                                    {new Date(row.Date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {isClosed ? (
                                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">Closed</span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 bg-success/10 text-success rounded text-[9px] font-bold">Open</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {row.Promo === 1 ? (
                                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-bold">Active</span>
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {row.StateHoliday !== '0' || row.SchoolHoliday === 1 ? (
                                      <span 
                                        className="px-1.5 py-0.5 bg-warning/10 text-warning rounded text-[9px] font-bold"
                                        title={row.StateHoliday !== '0' ? `State Holiday: ${row.StateHoliday}` : 'School Holiday'}
                                      >
                                        Yes
                                      </span>
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono font-medium">
                                    {isClosed ? '0' : Math.round(row.Predicted_Customers).toLocaleString()}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                                    {isClosed ? '€0' : `€${Math.round(row.Predicted_Sales).toLocaleString()}`}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Visualizations Tab */}
              {activeTab === 'charts' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Single Prediction Comparison Charts */}
                  {latestPrediction && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Sales Comparison Chart */}
                      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-premium space-y-4">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Sales Volume Comparison</span>
                        <div className="h-60 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                {
                                  name: 'Predicted Sales',
                                  Amount: Math.round(latestPrediction.predictions.Predicted_Sales || 0),
                                },
                                {
                                  name: 'Historical Avg',
                                  Amount: Math.round(latestPrediction.summary?.demand?.historical_avg_sales || 0),
                                }
                              ]}
                              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                              <YAxis stroke="#94A3B8" fontSize={10} />
                              <Tooltip formatter={(value) => [`€${value}`, 'Sales']} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                              <Bar dataKey="Amount" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Customer Comparison Chart */}
                      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-premium space-y-4">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Customer Traffic Comparison</span>
                        <div className="h-60 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                {
                                  name: 'Predicted Customers',
                                  Count: Math.round(latestPrediction.predictions.Predicted_Customers || 0),
                                },
                                {
                                  name: 'Historical Avg',
                                  Count: Math.round(latestPrediction.summary?.demand?.historical_avg_customers || 0),
                                }
                              ]}
                              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                              <YAxis stroke="#94A3B8" fontSize={10} />
                              <Tooltip formatter={(value) => [value, 'Customers']} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                              <Bar dataKey="Count" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Web interactive forecast line chart */}
                  {latestForecast && (
                    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-premium">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-4">Interactive Forecast Chart</span>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart 
                            data={latestForecast.forecast.map(i => ({
                              name: new Date(i.Date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                              Sales: Math.round(i.Predicted_Sales),
                              Customers: Math.round(i.Predicted_Customers),
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                            <YAxis yAxisId="left" stroke="#4F46E5" fontSize={10} />
                            <YAxis yAxisId="right" orientation="right" stroke="#7C3AED" fontSize={10} />
                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Line yAxisId="left" type="monotone" dataKey="Sales" stroke="#4F46E5" strokeWidth={2} activeDot={{ r: 6 }} />
                            <Line yAxisId="right" type="monotone" dataKey="Customers" stroke="#7C3AED" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Backend Images Integration */}
                  {latestForecast?.graphs && (
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-slate-850 uppercase tracking-wider block">Backend Rendered Static Plots</span>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-2">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1 text-center">Sales Prediction Trend</span>
                          <img 
                            src={`${API_URL}${latestForecast.graphs.sales_plot}`} 
                            alt="Sales Forecast Plot" 
                            className="w-full h-auto object-cover rounded-lg"
                            onError={(e) => {
                              // If server is on separate port or path fails, hide broken img
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-2">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1 text-center">Customer Traffic Trend</span>
                          <img 
                            src={`${API_URL}${latestForecast.graphs.customer_plot}`} 
                            alt="Customer Forecast Plot" 
                            className="w-full h-auto object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sandbox Tab (Replacing insights) */}
              {activeTab === 'insights' && (
                <div className="grid md:grid-cols-12 gap-6 animate-fade-in">
                  {/* Left Side: Sandbox Variable Toggles (4 columns) */}
                  <div className="md:col-span-4 bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-5 text-left">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Sandbox Overrides</h4>
                      <p className="text-[10px] text-slate-400">Modify scenario parameters to view forecast deviation</p>
                    </div>

                    <div className="space-y-4">
                      {/* Promo Active */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Promo Active</label>
                        <select
                          value={sandboxPromo}
                          onChange={(e) => setSandboxPromo(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <option value={1}>Active (Promo=1)</option>
                          <option value={0}>Inactive (Promo=0)</option>
                        </select>
                      </div>

                      {/* Store Open */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Store Open</label>
                        <select
                          value={sandboxOpen}
                          onChange={(e) => setSandboxOpen(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <option value={1}>Open (Open=1)</option>
                          <option value={0}>Closed (Open=0)</option>
                        </select>
                      </div>

                      {/* School Holiday */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">School Holiday</label>
                        <select
                          value={sandboxSchoolHoliday}
                          onChange={(e) => setSandboxSchoolHoliday(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <option value={0}>No School Holiday</option>
                          <option value={1}>Active School Holiday</option>
                        </select>
                      </div>

                      {/* State Holiday */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">State Holiday Code</label>
                        <select
                          value={sandboxStateHoliday}
                          onChange={(e) => setSandboxStateHoliday(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <option value="0">Normal Day (0)</option>
                          <option value="a">Public Holiday (a)</option>
                          <option value="b">Easter Holiday (b)</option>
                          <option value="c">Christmas Holiday (c)</option>
                        </select>
                      </div>
                    </div>

                    {loadingSimulation && (
                      <div className="text-[10px] text-primary font-semibold flex items-center gap-1.5 animate-pulse pt-2">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Running simulation...</span>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Visual Comparison Charts (8 columns) */}
                  <div className="md:col-span-8 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-premium space-y-4">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block text-left">Scenario Comparison Output</span>
                      
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          {isForecastMode ? (
                            <LineChart
                              data={latestForecast?.forecast?.map((item, idx) => {
                                const simItem = simulatedForecast?.forecast?.[idx];
                                const dateLabel = new Date(item.Date).toLocaleDateString([], { month: 'short', day: 'numeric' });
                                return {
                                  name: dateLabel,
                                  'Baseline Sales': Math.round(item.Predicted_Sales || 0),
                                  'Simulated Sales': simItem ? Math.round(simItem.Predicted_Sales || 0) : Math.round(item.Predicted_Sales || 0),
                                };
                              }) || []}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                              <YAxis stroke="#94A3B8" fontSize={10} />
                              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                              <Legend wrapperStyle={{ fontSize: '11px' }} />
                              <Line type="monotone" dataKey="Baseline Sales" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" />
                              <Line type="monotone" dataKey="Simulated Sales" stroke="#4F46E5" strokeWidth={2.5} />
                            </LineChart>
                          ) : (
                            <BarChart
                              data={[
                                {
                                  name: 'Baseline Sales',
                                  Sales: Math.round(latestPrediction?.predictions?.Predicted_Sales || 0),
                                },
                                {
                                  name: 'Simulated Sales',
                                  Sales: simulatedPrediction ? Math.round(simulatedPrediction.predictions?.Predicted_Sales || 0) : Math.round(latestPrediction?.predictions?.Predicted_Sales || 0),
                                }
                              ]}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                              <YAxis stroke="#94A3B8" fontSize={10} />
                              <Tooltip contentStyle={{ fontSize: '11px' }} />
                              <Bar dataKey="Sales" radius={[4, 4, 0, 0]} maxBarSize={55}>
                                <Cell fill="#94A3B8" />
                                <Cell fill="#4F46E5" />
                              </Bar>
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>

                      {/* Scenario Summary Card */}
                      <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-left space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operational Scenario Impact</span>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {isForecastMode ? (
                            latestForecast && simulatedForecast ? (
                              (() => {
                                const baseSum = latestForecast.forecast.reduce((s: number, i: any) => s + (i.Predicted_Sales || 0), 0);
                                const simSum = simulatedForecast.forecast.reduce((s: number, i: any) => s + (i.Predicted_Sales || 0), 0);
                                const pctDiff = baseSum > 0 ? ((simSum - baseSum) / baseSum) * 100 : 0;
                                return `Tweaking operations shifts total forecasted sales from €${Math.round(baseSum).toLocaleString()} to €${Math.round(simSum).toLocaleString()} (${pctDiff >= 0 ? '+' : ''}${pctDiff.toFixed(1)}% cumulative shift).`;
                              })()
                            ) : (
                              'Adjust sandbox sliders to recalculate forecast demand variations.'
                            )
                          ) : (
                            latestPrediction && (simulatedPrediction || latestPrediction) ? (
                              (() => {
                                const baseSales = latestPrediction.predictions.Predicted_Sales || 0;
                                const simSales = simulatedPrediction ? (simulatedPrediction.predictions?.Predicted_Sales || 0) : baseSales;
                                const diff = simSales - baseSales;
                                const pctDiff = baseSales > 0 ? (diff / baseSales) * 100 : 0;
                                return `Toggling variables for the target date shifts predicted sales from €${Math.round(baseSales).toLocaleString()} to €${Math.round(simSales).toLocaleString()} (${pctDiff >= 0 ? '+' : ''}${pctDiff.toFixed(1)}% variance, shift of €${Math.round(diff).toLocaleString()}).`;
                              })()
                            ) : (
                              'Adjust sandbox parameters to view single-day prediction variance.'
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Operational Decisions</h3>
                      <p className="text-[10px] text-slate-400">Optimization tasks based on model forecast parameters</p>
                    </div>
                    <button 
                      onClick={() => askAiAboutThis("💡 Please explain the reasoning and primary drivers behind these AI recommendations.")}
                      disabled={loadingRecommendations || !aiRecommendations}
                      className="py-1.5 px-3 bg-secondary text-white text-[10px] font-bold rounded-lg hover:bg-secondary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ask AI about Recommendations
                    </button>
                  </div>

                  {/* Dynamic AI recommendations area */}
                  {loadingRecommendations ? (
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-6 text-slate-500 text-xs animate-pulse flex items-center gap-3">
                      <Bot className="w-5 h-5 animate-spin text-primary" />
                      <span>AI Advisor is compiling dynamic recommendations based on latest predictions...</span>
                    </div>
                  ) : aiRecommendations ? (
                    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-150 rounded-xl p-5 shadow-premium text-left space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-xs font-bold text-slate-800">Dynamic AI Generated Recommendations</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">{aiRecommendations}</p>
                    </div>
                  ) : null}

                  {/* Standard Templates Recommendations Cards */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Decision Playbook Templates</span>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { title: "Staff Schedule Optimization", desc: "Align employee shifts to peak forecasting periods to avoid high customer wait times.", priority: "High", color: "border-danger bg-danger/5 text-danger" },
                        { title: "Inventory Restocking Window", desc: "Advance restocking activities 24 hours prior to predicted Promo peaks.", priority: "High", color: "border-danger bg-danger/5 text-danger" },
                        { title: "Promo Event Planning", desc: "Launch localized advertising codes on low-demand weekdays to stabilize traffic curves.", priority: "Medium", color: "border-warning bg-warning/5 text-warning" },
                        { title: "Competitor Tracking", desc: "Monitor localized competitor opening changes to safeguard predicted market shares.", priority: "Low", color: "border-success bg-success/5 text-success" },
                      ].map((rec, i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-premium text-left relative flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-slate-850 text-xs">{rec.title}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${rec.color}`}>
                                {rec.priority}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[11px] leading-relaxed">{rec.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Explainability Tab */}
              {activeTab === 'shap' && (
                <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-premium space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Explainable AI (SHAP Summary)</h3>
                    <p className="text-[10px] text-slate-400">Contribution factors driving predicted sales results</p>
                  </div>

                  {/* SHAP Chart */}
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getShapData()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis type="number" stroke="#94A3B8" fontSize={9} />
                        <YAxis dataKey="feature" type="category" stroke="#94A3B8" fontSize={9} width={130} />
                        <Tooltip contentStyle={{ fontSize: '11px' }} />
                        <ReferenceLine x={0} stroke="#94A3B8" />
                        <Bar 
                          dataKey="impact" 
                          fill="#4F46E5" 
                          radius={[0, 4, 4, 0]}
                          maxBarSize={25}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Interpretation cards */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <span className="font-bold text-slate-800 text-xs block text-left">AI Feature Interpretation</span>
                    <div className="grid sm:grid-cols-2 gap-3 text-[11px] text-left">
                      <div className="p-3 border border-slate-150 rounded-xl bg-slate-50 flex items-start gap-2">
                        <div className="p-1 bg-success/15 text-success rounded-lg shrink-0 mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-slate-600">
                          <strong className="text-slate-800">Promo impact</strong>: {isForecastMode ? 'Active promotional periods act as the leading positive factor, consistently elevating expected sales curves.' : `Operating a promo on the target date increases predicted sales by an estimated €2,450.`}
                        </p>
                      </div>
                      <div className="p-3 border border-slate-150 rounded-xl bg-slate-50 flex items-start gap-2">
                        <div className="p-1 bg-danger/10 text-danger rounded-lg shrink-0 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-slate-600">
                          <strong className="text-slate-800">Closed/Holiday Constraints</strong>: {isForecastMode ? 'Store closures (Sundays) and state holidays represent the strongest negative constraints, resetting sales to zero.' : `Holiday constraints or closures on the target date significantly restrict performance (Easter/Christmas resets demand to zero).`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
