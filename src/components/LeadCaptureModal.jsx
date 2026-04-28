import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { recordLead } from '../utils/supabaseClient';
import { X, ArrowRight, CheckCircle } from 'lucide-react';

export default function LeadCaptureModal({ isOpen, onClose, toolUsed }) {
  const [formData, setFormData] = useState({ name: '', contact: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    await recordLead({
      name: formData.name,
      contact: formData.contact,
      tool_used: toolUsed || 'general'
    });

    setStatus('success');
    setTimeout(() => {
      onClose();
      setStatus('idle');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl pointer-events-auto relative bg-white/90"
            >
              <button onClick={onClose} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>

              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="w-16 h-16 text-accent mb-4" />
                  <h3 className="text-2xl font-bold text-slate-800">Awesome!</h3>
                  <p className="text-slate-500 text-center mt-2">Check your inbox soon for more business tips.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">Get Free Business Templates</h3>
                    <p className="text-slate-500 mt-2 text-sm">Join 10,000+ Indian businesses getting our exclusive tools and PDF templates for free.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        required
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        required
                        placeholder="Email or WhatsApp Number"
                        value={formData.contact}
                        onChange={e => setFormData({...formData, contact: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={status === 'loading'}
                      className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white font-semibold flex justify-center items-center group"
                    >
                      {status === 'loading' ? 'Saving...' : 'Get Free Access'}
                      {status !== 'loading' && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-4">We hate spam as much as you do.</p>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
