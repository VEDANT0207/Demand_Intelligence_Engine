import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Download, Play, CheckCircle2, ShieldAlert, Trash2 } from 'lucide-react';
import axios from 'axios';

interface BatchPredictionResult {
  Store: number;
  Date: string;
  Promo: number;
  Open: number;
  StateHoliday: string;
  SchoolHoliday: number;
  Predicted_Sales?: number;
  Predicted_Customers?: number;
  [key: string]: any;
}

export const BatchPrediction: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BatchPredictionResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const validateFile = (file: File) => {
    const filename = file.name.toLowerCase();
    if (filename.endsWith('.csv') || filename.endsWith('.xlsx')) {
      setFile(file);
      setError(null);
      setResults([]);
    } else {
      setError('Unsupported file type. Please upload a CSV or Excel (.xlsx) file.');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResults([]);
    setProgress(0);
    setError(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setProgress(15);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Fake progress steps
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 10;
        });
      }, 300);

      const response = await axios.post(`${API_URL}/predict/batch/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(interval);
      setProgress(100);
      setResults(response.data.predictions || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process batch file. Check format.');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (results.length === 0) return;
    
    // Map objects to CSV strings
    const headers = Object.keys(results[0]).join(',');
    const rows = results.map(row => 
      Object.values(row).map(value => `"${value}"`).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `batch_predictions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left font-sans select-none animate-fade-in">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Batch Prediction Portal</h1>
        <p className="text-xs text-slate-500 mt-1">Upload large operational datasets to compute parallel model forecasts</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Upload zone (5 columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
            <UploadCloud className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">File Ingestion</h2>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-danger/5 border border-danger/20 text-danger text-xs font-semibold rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!file ? (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv,.xlsx" 
              />
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 text-slate-400 group-hover:text-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-all mb-4">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 block">Drag and drop file here</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Supports CSV or Excel (.xlsx) formats up to 10MB</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                {!loading && (
                  <button 
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Progress bar */}
              {progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Processing file...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Upload trigger */}
              <button
                onClick={handleUploadSubmit}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl active:transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-55 shadow-premium"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{loading ? 'Running Parallel Analysis...' : 'Start Batch Processing'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Data Table (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-premium">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Results Log</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Predictions compiled from model engines</p>
            </div>
            {results.length > 0 && (
              <button
                onClick={handleDownloadCSV}
                className="py-1.5 px-3 bg-success hover:bg-success/90 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center rounded-xl shadow-sm animate-pulse">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-700 block">No batch results loaded</span>
                <span className="text-[10px] text-slate-400 max-w-xs block mx-auto leading-relaxed">
                  Provide a store historical CSV file to execute the model and download predictions.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info summary */}
              <div className="p-3 bg-success/5 border border-success/15 rounded-xl flex items-center gap-2.5 text-xs text-success-dark font-medium">
                <CheckCircle2 className="w-4.5 h-4.5 text-success" />
                <span>Successfully generated {results.length} predictions from batch analysis.</span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 text-left">Store</th>
                      <th className="py-2.5 px-4 text-left">Date</th>
                      <th className="py-2.5 px-4 text-left">Promo</th>
                      <th className="py-2.5 px-4 text-left">Open</th>
                      <th className="py-2.5 px-4 text-right">Predicted Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {results.slice(0, 8).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-bold text-slate-800">#{row.Store}</td>
                        <td className="py-2.5 px-4 text-slate-500">{row.Date}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.Promo === 1 ? 'bg-primary-light text-primary' : 'bg-slate-100 text-slate-500'}`}>
                            {row.Promo === 1 ? 'Promo' : 'None'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.Open === 1 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                            {row.Open === 1 ? 'Open' : 'Closed'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                          {row.Predicted_Sales !== undefined 
                            ? `€${Math.round(row.Predicted_Sales).toLocaleString()}` 
                            : 'N/A'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {results.length > 8 && (
                <span className="text-[10px] text-slate-400 italic block text-center">
                  Showing first 8 records of {results.length} total. Export the full CSV file to view all rows.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
