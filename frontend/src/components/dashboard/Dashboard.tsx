import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  TrendingUp, 
  Users, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  UploadCloud, 
  Play, 
  MessageSquareCode, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    latestPrediction, 
    latestForecast, 
    setLatestForecast,
    setLatestBusinessContext,
    setAiAssistantOpen, 
    aiAssistantOpen 
  } = useStore();

  const [loadingForecast, setLoadingForecast] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // If we already have a forecast loaded in the global store, do not auto-fetch
    if (latestForecast) return;

    // Check if user has a preferred store or a previously predicted store
    const savedStore = localStorage.getItem('userPreferredStore') || localStorage.getItem('lastPredictedStore');
    const savedDate = localStorage.getItem('lastPredictedDate') || '2026-08-01';

    if (savedStore) {
      const fetchDashboardForecast = async () => {
        setLoadingForecast(true);
        setLoadingError(null);
        try {
          const payload = {
            Store: Number(savedStore),
            Date: savedDate,
            Promo: 1,
            Open: 1,
            SchoolHoliday: 0,
            StateHoliday: '0',
            forecast_days: 7,
          };
          const response = await axios.post(`${API_URL}/forecast/`, payload);
          setLatestForecast(response.data);
          setLatestBusinessContext(response.data.summary);
        } catch (err) {
          console.error("Dashboard auto-forecast compilation failed:", err);
          setLoadingError("Failed to auto-fetch preferred store forecast.");
        } finally {
          setLoadingForecast(false);
        }
      };

      fetchDashboardForecast();
    }
  }, [latestPrediction, latestForecast, setLatestForecast, setLatestBusinessContext]);

  const isDemo = !latestPrediction && !latestForecast;

  // Mock demo data to show if no forecasts are active
  const demoChartData = [
    { name: 'Mon', Sales: 5200, Customers: 480 },
    { name: 'Tue', Sales: 5800, Customers: 520 },
    { name: 'Wed', Sales: 4900, Customers: 460 },
    { name: 'Thu', Sales: 7200, Customers: 610 },
    { name: 'Fri', Sales: 8100, Customers: 750 },
    { name: 'Sat', Sales: 9500, Customers: 890 },
    { name: 'Sun', Sales: 0, Customers: 0 },
  ];

  // Map forecast data to Recharts chart points
  const activeChartData = latestForecast?.forecast?.map(item => {
    // Format date string from iso to short format
    const dateObj = new Date(item.Date);
    const day = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return {
      name: day,
      Sales: Math.round(item.Predicted_Sales || 0),
      Customers: Math.round(item.Predicted_Customers || 0),
    };
  }) || [];

  const chartData = isDemo ? demoChartData : activeChartData.slice(0, 14); // show first 14 points

  // KPI Calculations
  let displaySales = "€0.00";
  let displayCustomers = "0";
  let trendIndicator = "No Data";
  let topRecommendation = "Run prediction to view AI advice";

  if (!isDemo) {
    if (latestForecast) {
      const totalSales = latestForecast.forecast.reduce((sum, item) => sum + (item.Predicted_Sales || 0), 0);
      const totalCustomers = latestForecast.forecast.reduce((sum, item) => sum + (item.Predicted_Customers || 0), 0);
      displaySales = `€${Math.round(totalSales).toLocaleString()}`;
      displayCustomers = Math.round(totalCustomers).toLocaleString();
      trendIndicator = "Forecast loaded";
      const peakDate = latestForecast.summary?.peak_sales_day;
      const formattedPeak = peakDate ? new Date(peakDate).toLocaleDateString([], { weekday: 'long' }) : 'peak days';
      const promoRate = latestForecast.forecast.filter(f => f.Promo === 1).length / latestForecast.forecast.length;
      if (promoRate < 0.3) {
        topRecommendation = `Boost promos on ${formattedPeak}s to capture peak demand.`;
      } else {
        topRecommendation = `Optimize staffing on ${formattedPeak} to support peak traffic.`;
      }
    } else if (latestPrediction) {
      displaySales = `€${Math.round(latestPrediction.predictions.Predicted_Sales || 0).toLocaleString()}`;
      displayCustomers = Math.round(latestPrediction.predictions.Predicted_Customers || 0).toLocaleString();
      trendIndicator = "Single prediction active";
      const isPromo = latestPrediction.predictions.Promo === 1;
      const isOpen = latestPrediction.predictions.Open === 1;
      if (!isOpen) {
        topRecommendation = "Store is closed. Schedule maintenance operations.";
      } else if (isPromo) {
        topRecommendation = "Promo active. Ensure optimal stock availability.";
      } else {
        topRecommendation = "Launch a flash promo to boost store traffic.";
      }
    }
  } else {
    // Demo metrics
    displaySales = "€40,700";
    displayCustomers = "3,710";
    trendIndicator = "+12% Weekly average";
    topRecommendation = "Run promotional marketing events on Thursdays for store traffic growth.";
  }

  // Row 3 Stats
  const peakDateStr = latestForecast?.summary?.summary?.peak_sales_day;
  const formattedPeakDay = peakDateStr ? new Date(peakDateStr).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }) : "N/A";
  const lowestDateStr = latestForecast?.summary?.summary?.lowest_sales_day;
  const formattedLowestDay = lowestDateStr ? new Date(lowestDateStr).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }) : "N/A";

  const peakSales = isDemo ? "Saturday" : formattedPeakDay;
  const lowestSales = isDemo ? "Sunday" : formattedLowestDay;
  const volatility = isDemo ? "Medium (14.2%)" : (latestForecast?.summary?.summary?.sales_volatility_percent !== undefined ? `${latestForecast.summary.summary.sales_volatility_percent}%` : '0%');
  const openDays = isDemo ? "6 / 7 Days" : `${latestForecast?.summary?.summary?.open_days || '0'} Days`;

  // Timeline calculation
  let timelineText = "";
  if (!isDemo && latestForecast?.forecast?.length) {
    const startDateStr = latestForecast.forecast[0].Date;
    const endDateStr = latestForecast.forecast[latestForecast.forecast.length - 1].Date;
    
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    timelineText = `${formatDate(startDateStr)} - ${formatDate(endDateStr)}`;
  } else if (isDemo) {
    timelineText = "Demo Playground (Current Week)";
  }

  if (loadingForecast) {
    const storeName = localStorage.getItem('userPreferredStore') || localStorage.getItem('lastPredictedStore') || '1';
    return (
      <div className="space-y-8 animate-pulse select-none text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time demand forecasting and strategic indicators</p>
        </div>

        {/* Loading Indicator Alert */}
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-2xl">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Compiling Live Forecasts for Store {storeName}...</span>
        </div>

        {/* Row 1 Grid Skeletons */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium h-32 space-y-4">
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
              <div className="h-6 w-32 bg-slate-200 rounded"></div>
              <div className="h-2.5 w-24 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Row 2 Chart Skeletons */}
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium h-85 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-3.5 w-40 bg-slate-200 rounded"></div>
                <div className="h-2.5 w-28 bg-slate-200 rounded"></div>
              </div>
              <div className="h-44 w-full bg-slate-50 rounded-xl border border-dashed border-slate-205 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Generating Forecast Curve...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Dashboard</h1>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs">
            <span className="text-slate-500">Real-time demand forecasting and strategic indicators</span>
            {timelineText && (
              <>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-lg border border-primary/10">
                  {timelineText}
                </span>
              </>
            )}
          </div>
        </div>
        {isDemo && !loadingError && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-warning/10 border border-warning/20 text-warning text-xs font-bold rounded-xl animate-pulse">
            <AlertCircle className="w-4.5 h-4.5" />
            <span>Demo Playground - No Active Forecasts</span>
          </div>
        )}
        {loadingError && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-danger/10 border border-danger/20 text-danger text-xs font-bold rounded-xl animate-pulse">
            <AlertCircle className="w-4.5 h-4.5" />
            <span>{loadingError}</span>
          </div>
        )}
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Predicted Sales", value: displaySales, desc: "Estimated sales value", icon: DollarSign, color: "text-primary bg-primary-light" },
          { label: "Predicted Customers", value: displayCustomers, desc: "Estimated customer volume", icon: Users, color: "text-secondary bg-secondary-light" },
          { label: "Demand Trend", value: trendIndicator, desc: "Current forecasting status", icon: TrendingUp, color: "text-accent bg-accent-light" },
          { label: "Top Recommendation", value: topRecommendation, desc: "Optimization recommendations", icon: Sparkles, color: "text-success bg-success/15" },
        ].map((card, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block">{card.value}</span>
              <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">{card.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Estimated Sales Trend</h3>
              <p className="text-[10px] text-slate-400">Predicted daily volume fluctuations</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="Sales" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Trend Chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Estimated Customer Trend</h3>
              <p className="text-[10px] text-slate-400">Predicted daily customer traffic</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="Customers" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#custGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 & 4 Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Row 3: Forecast Summary */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Operational Summary</h3>
            <p className="text-[10px] text-slate-400">Peak demand and volatility metrics</p>
          </div>

          <div className="space-y-4">
            {[
              { label: "Peak Sales Day", value: peakSales, desc: "Highest estimated sales period" },
              { label: "Lowest Sales Day", value: lowestSales, desc: "Lowest estimated sales period" },
              { label: "Sales Volatility", value: volatility, desc: "Standard deviation of demand" },
              { label: "Store Open Days", value: openDays, desc: "Total operational scheduled days" },
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">{stat.label}</span>
                  <span className="text-[9px] text-slate-400">{stat.desc}</span>
                </div>
                <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-lg">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 4: Quick Actions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Quick Action Console</h3>
            <p className="text-[10px] text-slate-400 mb-6">Launch single prediction forms or upload batch sets</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/prediction')} 
              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex flex-col items-center justify-center text-center gap-2 group"
            >
              <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Predict Sales</span>
            </button>

            <button 
              onClick={() => navigate('/prediction?mode=forecast')} 
              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex flex-col items-center justify-center text-center gap-2 group"
            >
              <div className="p-2 bg-secondary/10 text-secondary rounded-lg group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Run Forecast</span>
            </button>

            <button 
              onClick={() => navigate('/batch-prediction')} 
              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex flex-col items-center justify-center text-center gap-2 group"
            >
              <div className="p-2 bg-success/10 text-success rounded-lg group-hover:scale-105 transition-transform">
                <UploadCloud className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Upload CSV</span>
            </button>

            <button 
              onClick={() => setAiAssistantOpen(!aiAssistantOpen)} 
              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex flex-col items-center justify-center text-center gap-2 group"
            >
              <div className="p-2 bg-accent/10 text-accent rounded-lg group-hover:scale-105 transition-transform">
                <MessageSquareCode className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Row 5: Recent Activity */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">System Activity Log</h3>
            <p className="text-[10px] text-slate-400 mb-6">Historical operations audit logs</p>
          </div>

          <div className="space-y-4 flex-1">
            {[
              { title: "Forecast Generated", time: "Just now", type: "success" },
              { title: "Prediction Compiled", time: "25 min ago", type: "success" },
              { title: "Business Report PDF Generated", time: "2 hours ago", type: "info" },
              { title: "Batch Predictions Run", time: "1 day ago", type: "info" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-3 items-start text-left">
                <div className="p-1 bg-slate-100 text-slate-500 rounded-full mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-850 block">{activity.title}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State Welcome Overlay if completely new */}
      {isDemo && (
        <div className="p-8 bg-gradient-to-tr from-primary/5 via-secondary/5 to-white border border-slate-200/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-left space-y-2">
            <h3 className="text-lg font-black text-slate-900">Welcome to Demand Intelligence Platform</h3>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              To begin compiling customized models, navigate to the **Prediction Workspace** to execute your first forecasting query or run bulk uploads via **Batch Predictions**.
            </p>
          </div>
          <button 
            onClick={() => navigate('/prediction')}
            className="py-3 px-5 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-xl shadow-premium hover:shadow-premium-hover active:transform active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            Launch Prediction Form
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
