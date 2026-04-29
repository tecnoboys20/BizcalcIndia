import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Crown, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PricingPage() {
  const { isPremium, referralsCount, simulateReferralSignup, openAuthModal, user } = useAuth();
  
  // 10 minute FOMO countdown timer logic
  const [timeLeft, setTimeLeft] = useState(10 * 60);

  useEffect(() => {
    // Check if a deadline was previously saved in localStorage
    const savedDeadline = localStorage.getItem('bizcalc_fomo_deadline');
    let deadline;

    if (savedDeadline) {
      deadline = parseInt(savedDeadline, 10);
    } else {
      deadline = Date.now() + 10 * 60 * 1000;
      localStorage.setItem('bizcalc_fomo_deadline', deadline.toString());
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const difference = deadline - now;
      
      if (difference <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(difference / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6"
          >
            Simple pricing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">smart businesses</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500"
          >
            Start using all our free tools immediately, or unlock Premium instantly by referring just 3 friends.
          </motion.p>
        </div>

        {/* Current Status Box (for testing) */}
        {user && (
          <div className="max-w-3xl mx-auto mb-12 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Your Current Status</h3>
            {isPremium ? (
              <div className="inline-flex items-center gap-2 text-yellow-700 bg-yellow-100 px-4 py-2 rounded-full font-bold">
                <Crown className="w-5 h-5" /> You are a Premium Member!
              </div>
            ) : (
              <div>
                <p className="text-slate-600 mb-4">You have referred <strong>{referralsCount} / 3</strong> friends.</p>
                <div className="w-full bg-slate-100 rounded-full h-3 mb-4 max-w-sm mx-auto overflow-hidden">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${(referralsCount / 3) * 100}%` }}
                  ></div>
                </div>
                {/* Developer testing button */}
                <button 
                  onClick={simulateReferralSignup}
                  className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded hover:bg-slate-300"
                >
                  [DEV TEST: Simulate 1 Friend Signup]
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">Free</h3>
            <p className="text-slate-500 text-sm mb-6">Perfect for new businesses.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-slate-800">₹0</span>
              <span className="text-slate-500">/forever</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-slate-600"><Check className="w-5 h-5 text-green-500 shrink-0" /> Basic GST Calculator</li>
              <li className="flex items-start gap-3 text-slate-600"><Check className="w-5 h-5 text-green-500 shrink-0" /> Basic Invoicing</li>
              <li className="flex items-start gap-3 text-slate-600"><Check className="w-5 h-5 text-green-500 shrink-0" /> Standard Support</li>
            </ul>
            {!user ? (
              <button onClick={openAuthModal} className="w-full py-3 px-4 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                Get Started
              </button>
            ) : (
              <button disabled className="w-full py-3 px-4 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                Current Plan
              </button>
            )}
          </motion.div>

          {/* Premium Tier (Featured) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 rounded-3xl p-8 border-2 border-primary shadow-xl relative flex flex-col transform md:-translate-y-4"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
              Most Popular
            </div>
            
            <div className="flex justify-between items-start mb-2 mt-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Crown className="w-5 h-5 text-yellow-400" /> Premium</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">All features unlocked. No limits.</p>
            
            <div className="mb-6 relative">
              <span className="text-4xl font-extrabold text-white">₹999</span>
              <span className="text-slate-400">/year</span>
              
              {/* FOMO Override Box */}
              {!isPremium && timeLeft > 0 && (
                <div className="absolute -inset-x-4 -inset-y-4 bg-slate-800/90 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center justify-center text-center border border-slate-700 shadow-inner z-10">
                  <span className="text-green-400 font-bold text-lg mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Unlock FREE for 3 Months!
                  </span>
                  <p className="text-slate-300 text-xs mb-2">Refer 3 friends before time runs out:</p>
                  <div className="flex items-center gap-2 text-white font-mono text-2xl font-bold bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                    <Clock className="w-5 h-5 text-red-400 animate-pulse" />
                    {formatTime(timeLeft)}
                  </div>
                </div>
              )}
            </div>

            <ul className="space-y-4 mb-8 flex-1 text-slate-300 relative z-0">
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> Everything in Free</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> Unlimited Saved Invoices</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> Zero Advertisements</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> Priority 24/7 Support</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> Custom Logo on PDFs</li>
            </ul>

            {isPremium ? (
              <button disabled className="w-full py-3 px-4 bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-lg relative z-20">
                You Have Premium!
              </button>
            ) : (
              <button 
                onClick={user ? null : openAuthModal}
                className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 relative z-20"
              >
                {user ? "Get Your Share Link" : "Sign In to Unlock Free"}
              </button>
            )}
          </motion.div>

          {/* Silver Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">Silver</h3>
            <p className="text-slate-500 text-sm mb-6">For growing solopreneurs.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-slate-800">₹499</span>
              <span className="text-slate-500">/year</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-slate-600"><Check className="w-5 h-5 text-slate-400 shrink-0" /> Everything in Free</li>
              <li className="flex items-start gap-3 text-slate-600"><Check className="w-5 h-5 text-slate-400 shrink-0" /> Save up to 50 Invoices</li>
              <li className="flex items-start gap-3 text-slate-600"><Check className="w-5 h-5 text-slate-400 shrink-0" /> Remove Watermarks</li>
            </ul>
            <button className="w-full py-3 px-4 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              Buy Silver
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
