import React, { useState, useEffect } from 'react';
import ToolCard from '../ToolCard';
import { calculateDiscount } from '../../utils/calculations';
import { formatINR } from '../../utils/formatters';
import { Tag } from 'lucide-react';

export default function DiscountCalculator({ onCalculate }) {
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (price && discount) {
      setResult(calculateDiscount(price, discount));
      onCalculate();
    } else {
      setResult(null);
    }
  }, [price, discount]);

  return (
    <ToolCard 
      title="Discount Calculator" 
      description="Find out the final price after applying a percentage discount."
      icon={<Tag className="w-6 h-6" />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Original Price (₹)</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="e.g. 1500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Discount (%)</label>
            <input 
              type="number" 
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="e.g. 20"
            />
          </div>
        </div>

        {result && (
          <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
            <div>
              <div className="text-sm text-slate-500 mb-1">You Save</div>
              <div className="text-xl font-bold text-accent">{formatINR(result.savings)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">Final Price</div>
              <div className="text-2xl font-bold text-primary">{formatINR(result.finalPrice)}</div>
            </div>
          </div>
        )}
      </div>
    </ToolCard>
  );
}
