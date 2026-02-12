
import React, { useCallback } from 'react';
import { RawEvent } from '../types';
import * as d3 from 'd3';

interface DataUploaderProps {
  onUpload: (data: RawEvent[]) => void;
}

export const DataUploader: React.FC<DataUploaderProps> = ({ onUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      const parsed = d3.csvParse(csvData) as unknown as RawEvent[];
      onUpload(parsed);
    };
    reader.readAsText(file);
  };

  const generateMockData = useCallback(() => {
    const countries = ['USA', 'usa', 'UK', 'uk', 'Germany', 'germany', ' France ', 'Japan', null];
    const events = ['view', 'view', 'add_to_cart', 'purchase', 'purchase', 'refund', 'signup', 'view'];
    const users = Array.from({ length: 50 }, (_, i) => `user_${i + 1}`);
    const devices = ['mobile', 'web', 'tablet', 'iOS', 'Android'];
    
    const mock: RawEvent[] = Array.from({ length: 500 }, () => {
      const event = events[Math.floor(Math.random() * events.length)];
      const isRevenueEvent = event === 'purchase' || event === 'refund';
      
      return {
        user_id: users[Math.floor(Math.random() * users.length)],
        event_type: event,
        revenue: isRevenueEvent ? (event === 'refund' ? -Math.floor(Math.random() * 100) : Math.floor(Math.random() * 500)) : 0,
        country: countries[Math.floor(Math.random() * countries.length)] || undefined,
        currency: 'USD',
        device: devices[Math.floor(Math.random() * devices.length)],
        timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString()
      };
    });

    // Add some "messy" data
    mock.push({ user_id: 'user_99', event_type: 'PURCHASE', country: 'usa ', revenue: '120.50' });
    mock.push({ user_id: 'user_99', event_type: 'PURCHASE', country: 'usa ', revenue: '120.50' }); // Duplicate
    mock.push({ user_id: '', event_type: 'view' }); // Invalid
    mock.push({ user_id: 'user_1', event_type: 'purchase', revenue: null }); // Missing rev

    onUpload(mock);
  }, [onUpload]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-xl w-full text-center space-y-6 bg-white p-12 rounded-3xl border border-slate-200 shadow-xl">
        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Upload Dataset</h2>
        <p className="text-slate-500 text-lg">
          Upload your <code className="bg-slate-100 px-1.5 py-0.5 rounded mono text-sm">intern_takehome_events.csv</code> to begin the automated analysis and cleaning process.
        </p>
        
        <div className="flex flex-col gap-4">
          <label className="relative cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-indigo-200">
            <span>Choose CSV File</span>
            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
          </label>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Or</span></div>
          </div>
          
          <button 
            onClick={generateMockData}
            className="w-full py-4 border-2 border-slate-200 border-dashed rounded-xl font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all bg-slate-50"
          >
            Generate Sample Dataset (Mock)
          </button>
        </div>
      </div>
    </div>
  );
};
