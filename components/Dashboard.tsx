
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { CleanedEvent, AggregationResults, EventType } from '../types';
import * as d3 from 'd3';

interface DashboardProps {
  data: CleanedEvent[];
  aggregations: AggregationResults;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export const Dashboard: React.FC<DashboardProps> = ({ data, aggregations }) => {
  // Insight 1: Device Patterns (Device vs Revenue)
  const deviceData = Array.from(
    d3.rollup(data, v => d3.sum(v, d => d.revenue), d => d.device),
    ([name, value]) => ({ name, value })
  ).sort((a, b) => b.value - a.value);

  // Insight 2: Funnel Analysis
  const eventCounts = Array.from(
    d3.rollup(data, v => v.length, d => d.event_type),
    ([name, count]) => ({ name, count })
  ).sort((a, b) => b.count - a.count);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ARPU Card */}
      <div className="md:col-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-indigo-100 font-medium mb-1">Avg. Revenue Per User (ARPU)</h3>
          <p className="text-4xl font-bold tracking-tight">{formatCurrency(aggregations.arpu)}</p>
        </div>
        <div className="mt-8 text-sm text-indigo-100/80 leading-relaxed border-t border-white/10 pt-4">
          Calculated by dividing total revenue by the number of unique user IDs identified in the cleaned event stream.
        </div>
      </div>

      {/* Revenue by Country Bar Chart */}
      <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
          <span>Total Revenue by Country</span>
          <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-1 rounded">Task 1: Production</span>
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregations.revenueByCountry.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="country" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(val: number) => [formatCurrency(val), 'Revenue']}
              />
              <Bar dataKey="totalRevenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40}>
                {aggregations.revenueByCountry.map((_, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight 1: Device Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Device Revenue Mix</h3>
        <p className="text-xs text-slate-500 mb-6">Percentage of total revenue generated per platform.</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deviceData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {deviceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
            {deviceData.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                    <span className="text-xs font-medium text-slate-600 truncate uppercase">{d.name}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Insight 2: Event Distribution */}
      <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Event Engagement Funnel</h3>
        <p className="text-xs text-slate-500 mb-6">Volume of activities tracked across the session lifecycle.</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={eventCounts} margin={{left: 30}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
