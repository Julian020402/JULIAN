
import React from 'react';

export const Explanation: React.FC = () => {
  return (
    <div className="bg-indigo-900 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
      
      <h3 className="text-2xl font-bold mb-6">Task 3: Analysis Summary</h3>
      
      <div className="space-y-6 text-indigo-100/90 leading-relaxed">
        <section>
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Process Summary</h4>
          <p>
            I implemented a cleaning pipeline that first removes exact row duplicates and filters out events missing critical keys like <code className="bg-indigo-800 px-1 rounded font-mono text-xs">user_id</code>. 
            Casing for countries (e.g., 'usa' vs 'USA') and event types was normalized to uppercase/lowercase respectively, and whitespace was trimmed to ensure consistent aggregation. 
            Revenue was cast to floats, with non-numeric values defaulted to 0 for analysis safety.
          </p>
        </section>

        <section>
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Core Assumptions</h4>
          <p>
            I defined **Average Revenue Per User (ARPU)** as <span className="text-white font-bold italic">Total Revenue / Count of Unique Users</span> across the entire dataset. 
            An alternative would be "Revenue Per Paying User," but ARPU is a more standard indicator of general monetization efficiency across the whole traffic base. 
            I also assumed that any missing revenue on a 'view' event is safely 0, whereas missing revenue on a 'purchase' should be flagged as a data quality issue but treated as 0 in sums to prevent inflation.
          </p>
        </section>

        <section>
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Future Improvements</h4>
          <p>
            With more time, I would implement **Currency Conversion** using a historical rates API to normalize all revenue to a single base (e.g., USD), as aggregating different currencies directly leads to skewed results. 
            Additionally, I would perform session reconstruction to calculate conversion rates (Funnel Analysis) and identify high-drop-off points in the user journey.
          </p>
        </section>
      </div>
    </div>
  );
};
