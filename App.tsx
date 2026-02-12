
import React, { useState, useCallback, useMemo } from 'react';
import { DataUploader } from './components/DataUploader';
import { DataPreview } from './components/DataPreview';
import { Dashboard } from './components/Dashboard';
import { Explanation } from './components/Explanation';
import { RawEvent, CleanedEvent, CleaningLog, AggregationResults, EventType } from './types';
import * as d3 from 'd3';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<RawEvent[] | null>(null);
  const [cleanedData, setCleanedData] = useState<CleanedEvent[] | null>(null);
  const [cleaningLog, setCleaningLog] = useState<CleaningLog | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const cleanData = useCallback((data: RawEvent[]) => {
    setIsProcessing(true);
    let log: CleaningLog = {
      duplicatesRemoved: 0,
      nullsHandled: 0,
      casingFixed: 0,
      invalidDropped: 0,
    };

    // 1. Remove exact duplicates
    const initialCount = data.length;
    const uniqueStrings = new Set<string>();
    const uniqueData = data.filter(item => {
      const s = JSON.stringify(item);
      if (uniqueStrings.has(s)) return false;
      uniqueStrings.add(s);
      return true;
    });
    log.duplicatesRemoved = initialCount - uniqueData.length;

    const results: CleanedEvent[] = [];

    uniqueData.forEach(row => {
      // 2. Filter out rows with missing core identifiers
      if (!row.user_id || !row.event_type) {
        log.invalidDropped++;
        return;
      }

      // 3. Normalize casing and whitespace
      const event_type = row.event_type.trim().toLowerCase() as EventType;
      const country = (row.country || 'UNKNOWN').trim().toUpperCase();
      const currency = (row.currency || 'USD').trim().toUpperCase();
      const device = (row.device || 'web').trim().toLowerCase();

      if (row.country !== country || row.event_type !== event_type) {
        log.casingFixed++;
      }

      // 4. Handle Revenue
      let revenue = 0;
      if (row.revenue !== undefined && row.revenue !== null && row.revenue !== '') {
        revenue = typeof row.revenue === 'string' ? parseFloat(row.revenue) : row.revenue;
        if (isNaN(revenue)) {
          revenue = 0;
          log.nullsHandled++;
        }
      } else if (event_type === EventType.PURCHASE || event_type === EventType.REFUND) {
        // Log that we have missing revenue for financial rows
        log.nullsHandled++;
      }

      results.push({
        user_id: row.user_id,
        event_type,
        revenue,
        country,
        currency,
        device,
        timestamp: row.timestamp ? new Date(row.timestamp) : new Date(),
      });
    });

    setCleanedData(results);
    setCleaningLog(log);
    setIsProcessing(false);
  }, []);

  const handleFileUpload = (data: RawEvent[]) => {
    setRawData(data);
    cleanData(data);
  };

  const aggregations = useMemo(() => {
    if (!cleanedData) return null;

    // Total revenue by country
    const countryMap = d3.rollup(
      cleanedData,
      v => d3.sum(v, d => d.revenue),
      d => d.country
    );

    const revenueByCountry = Array.from(countryMap, ([country, totalRevenue]) => ({
      country,
      totalRevenue
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // ARPU: Average Revenue Per User
    // Definition: Total Revenue / Count of Unique Users
    const totalRevenue = d3.sum(cleanedData, d => d.revenue);
    const uniqueUsers = new Set(cleanedData.map(d => d.user_id)).size;
    const arpu = uniqueUsers > 0 ? totalRevenue / uniqueUsers : 0;

    return { revenueByCountry, arpu };
  }, [cleanedData]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data Science Take-Home Lab</h1>
          </div>
          <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Intern Assessment Tool
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-8">
        {!rawData ? (
          <div className="mt-12">
            <DataUploader onUpload={handleFileUpload} />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Task 1 & 2: Data Insights</h2>
                <p className="text-slate-500">Processing and visualizing event logs from client data.</p>
              </div>
              <button 
                onClick={() => {setRawData(null); setCleanedData(null);}}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Reset / Upload New File
              </button>
            </div>

            {cleaningLog && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Duplicates Removed" value={cleaningLog.duplicatesRemoved} icon="copy" />
                <StatCard label="Casing Normalized" value={cleaningLog.casingFixed} icon="text" />
                <StatCard label="Nulls Handled" value={cleaningLog.nullsHandled} icon="alert" />
                <StatCard label="Invalid Dropped" value={cleaningLog.invalidDropped} icon="trash" />
              </div>
            )}

            {cleanedData && aggregations && (
              <Dashboard data={cleanedData} aggregations={aggregations} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DataPreview data={cleanedData?.slice(0, 10) || []} title="Sample Cleaned Data (First 10 Rows)" />
              <Explanation />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} Data Science Take-Home Platform
      </footer>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`p-2 rounded-lg ${value > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
       {icon === 'copy' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" /></svg>}
       {icon === 'text' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5h12M9 5v12m0 0H7m2 0h2M3 17h18" /></svg>}
       {icon === 'alert' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
       {icon === 'trash' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default App;
