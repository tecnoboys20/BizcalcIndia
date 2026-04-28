import React, { useState, useEffect } from 'react';
import ToolCard from '../ToolCard';
import { calculateProfit } from '../../utils/calculations';
import { formatINR, formatPercent } from '../../utils/formatters';
import { TrendingUp } from 'lucide-react';

export default function ProfitCalculator({ onCalculate }) {
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (cost && price) {
      setResult(calculateProfit(cost, price));
      onCalculate();
    } else {
      setResult(null);
    }
  }, [cost, price]);

  return (
    <ToolCard 
      title="Profit Margin Calculator" 
      description="Determine your net profit, gross margin, and markup."
      icon={<TrendingUp className="w-6 h-6" />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cost Price (₹)</label>
            <input 
              type="number" 
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="e.g. 500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Selling Price (₹)</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="e.g. 800"
            />
          </div>
        </div>

        {result && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="text-sm text-slate-500 mb-1">Net Profit</div>
              <div className="text-xl font-bold text-accent">{formatINR(result.profit)}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="text-sm text-slate-500 mb-1">Gross Margin</div>
              <div className="text-xl font-bold text-primary">{formatPercent(result.margin)}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="text-sm text-slate-500 mb-1">Markup</div>
              <div className="text-xl font-bold text-slate-800">{formatPercent(result.markup)}</div>
            </div>
          </div>
        )}
      </div>
    </ToolCard>
  );
}
