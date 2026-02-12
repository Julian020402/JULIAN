
import React from 'react';
import { CleanedEvent } from '../types';

interface DataPreviewProps {
  data: CleanedEvent[];
  title: string;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data, title }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">User ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Event</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Revenue</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Country</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-3 text-sm font-medium text-slate-600 truncate max-w-[120px] mono">{row.user_id}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    row.event_type === 'purchase' ? 'bg-emerald-100 text-emerald-700' :
                    row.event_type === 'refund' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {row.event_type}
                  </span>
                </td>
                <td className={`px-6 py-3 text-sm font-semibold ${row.revenue < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {row.revenue.toFixed(2)}
                </td>
                <td className="px-6 py-3 text-sm text-slate-600">{row.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
         <span className="text-xs text-slate-400 italic">Showing first {data.length} rows of cleaned dataset.</span>
      </div>
    </div>
  );
};
