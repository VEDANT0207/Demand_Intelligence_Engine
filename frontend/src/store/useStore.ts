import { create } from 'zustand';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PredictionData {
  predictions: {
    Predicted_Sales?: number;
    Predicted_Customers?: number;
    [key: string]: any;
  };
  summary: {
    average_historical_sales?: number;
    average_historical_customers?: number;
    [key: string]: any;
  };
  llm_summary?: string | {
    summary?: string;
    actionable_insights?: string[];
    [key: string]: any;
  };
}

export interface ForecastRecord {
  Date: string;
  Store: number;
  Promo: number;
  Open: number;
  StateHoliday: string;
  SchoolHoliday: number;
  Predicted_Sales: number;
  Predicted_Customers: number;
  Is_Forecasted: number;
}

export interface ForecastData {
  forecast: ForecastRecord[];
  summary: {
    peak_sales_day?: string;
    lowest_sales_day?: string;
    sales_volatility?: number;
    open_days?: number;
    [key: string]: any;
  };
  llm_summary?: string | {
    summary?: string;
    key_findings?: string[];
    operational_implications?: string[];
    [key: string]: any;
  };
  graphs?: {
    sales_plot?: string;
    customer_plot?: string;
    weekly_sales_plot?: string;
  };
}

interface AppState {
  // Auth
  session: any | null;
  loadingSession: boolean;
  setSession: (session: any | null) => void;
  setLoadingSession: (loading: boolean) => void;

  // Prediction Data
  latestPrediction: PredictionData | null;
  setLatestPrediction: (data: PredictionData | null) => void;

  // Forecast Data
  latestForecast: ForecastData | null;
  setLatestForecast: (data: ForecastData | null) => void;

  // AI Chat & Context
  latestBusinessContext: any | null;
  chatHistory: ChatMessage[];
  setLatestBusinessContext: (context: any | null) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChatHistory: () => void;

  // Recommendations
  recommendations: any[] | null;
  setRecommendations: (data: any[] | null) => void;

  // API Status
  apiStatus: 'connected' | 'offline' | 'checking';
  setApiStatus: (status: 'connected' | 'offline' | 'checking') => void;

  // UI state
  aiAssistantOpen: boolean;
  setAiAssistantOpen: (open: boolean) => void;

  // Reset
  clearStore: () => void;
}

export const useStore = create<AppState>((set) => ({
  session: null,
  loadingSession: true,
  setSession: (session) => set({ session }),
  setLoadingSession: (loadingSession) => set({ loadingSession }),

  latestPrediction: null,
  setLatestPrediction: (latestPrediction) => set({ latestPrediction }),

  latestForecast: null,
  setLatestForecast: (latestForecast) => set({ latestForecast }),

  latestBusinessContext: null,
  chatHistory: [],
  setLatestBusinessContext: (latestBusinessContext) => set({ latestBusinessContext }),
  addChatMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  clearChatHistory: () => set({ chatHistory: [] }),

  recommendations: null,
  setRecommendations: (recommendations) => set({ recommendations }),

  apiStatus: 'checking',
  setApiStatus: (apiStatus) => set({ apiStatus }),

  aiAssistantOpen: false,
  setAiAssistantOpen: (aiAssistantOpen) => set({ aiAssistantOpen }),

  clearStore: () => set({
    latestPrediction: null,
    latestForecast: null,
    latestBusinessContext: null,
    chatHistory: [],
    recommendations: null,
    aiAssistantOpen: false,
  }),
}));
