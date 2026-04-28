import React, { useState, useEffect } from 'react';
import ToolCard from '../ToolCard';
import { calculateGST } from '../../utils/calculations';
import { formatINR } from '../../utils/formatters';
import { Percent } from 'lucide-react';

export default function GSTCalculator({ onCalculate }) {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('18');
  const [type, setType] = useState('add');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (amount) {
      const res = calculateGST(amount, rate, type);
      setResult(res);
      onCalculate(); // Trigger lead capture tracking
    } else {
      setResult(null);
    }
  }, [amount, rate, type]);

  return (
    <ToolCard 
      title="GST Calculator" 
      description="Quickly add or remove GST from any amount."
      icon={<Percent className="w-6 h-6" />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Base Amount (₹)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="e.g. 10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">GST Rate (%)</label>
            <div className="flex space-x-2">
              {['5', '12', '18', '28'].map(r => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${rate === r ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Calculation Type</label>
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setType('add')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'add' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
            >
              Add GST
            </button>
            <button
              onClick={() => setType('remove')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'remove' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
            >
              Remove GST
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500">Net Amount:</span>
              <span className="font-semibold text-slate-800">{formatINR(result.baseAmount)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500">GST Amount ({rate}%):</span>
              <span className="font-semibold text-accent">{type === 'add' ? '+' : '-'}{formatINR(result.gstAmount)}</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-lg font-medium text-slate-800">Final Total:</span>
              <span className="text-2xl font-bold text-primary">{formatINR(result.finalAmount)}</span>
            </div>
          </div>
        )}
      </div>
    </ToolCard>
  );
}
