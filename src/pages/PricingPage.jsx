import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Crown, Users, Copy, Mail, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

// ─── Invite Modal ────────────────────────────────────────────────────────────
function InviteModal({ isOpen, onClose, referralLink, referralCode }) {
  const [emails, setEmails] = useState(['', '', '']);
  const [copied, setCopied] = useState(false);
  const [states, setStates] = useState(['idle', 'idle', 'idle']); // idle | loading | sent | error

  const handleEmailChange = (index, value) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  const handleSendInvite = async (index) => {
    const email = emails[index];
    if (!email) return;

    const updated = [...states];
    updated[index] = 'loading';
    setStates(updated);

    try {
      const res = await fetch('/.netlify/functions/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: email, referralCode, fromName: 'A BizCalc India member' }),
      });
      const data = await res.json();
      const next = [...states];
      next[index] = data.success ? 'sent' : 'error';
      setStates(next);
    } catch {
      const next = [...states];
      next[index] = 'error';
      setStates(next);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[201] p-4 pointer-events-none"
          >
            <div onClick={(e) => e.stopPropagation()} className="pointer-events-all bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Invite 3 Friends</h3>
                    <p className="text-sm text-slate-400">Unlock Premium for 3 months free</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Email Inputs */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-3">Enter your friends' email addresses:</p>
                  <div className="space-y-3">
                    {emails.map((email, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="flex-1 relative">
                          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => handleEmailChange(i, e.target.value)}
                            disabled={states[i] === 'sent'}
                            placeholder={`Friend ${i + 1}'s email`}
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </div>
                        <button
                          onClick={() => handleSendInvite(i)}
                          disabled={!email || states[i] === 'loading' || states[i] === 'sent'}
                          className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1 min-w-[80px] justify-center ${
                            states[i] === 'sent' ? 'bg-green-500 text-white cursor-not-allowed' :
                            states[i] === 'error' ? 'bg-red-100 text-red-600' :
                            states[i] === 'loading' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
                            'bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed'
                          }`}
                        >
                          {states[i] === 'loading' ? '...' :
                           states[i] === 'sent' ? 'Sent' :
                           states[i] === 'error' ? 'Retry' :
                           <><ArrowRight size={14} /> Send</>}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-3">A sign-up invitation email will be sent directly to your friend via Supabase.</p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px bg-slate-100 flex-1" />
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">or share your link</span>
                  <div className="h-px bg-slate-100 flex-1" />
                </div>

                {/* Copy Link */}
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 truncate font-mono">
                    {referralLink}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Pricing Page ───────────────────────────────────────────────────────
export default function PricingPage() {
  const { isPremium, referralsCount, simulateReferralSignup, openAuthModal, user, profile } = useAuth();
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Referral link for this user
  const referralCode = profile?.referral_code || (user ? btoa(user.email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase() : 'BIZCALC');
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  // FOMO Timer
  useEffect(() => {
    const savedDeadline = localStorage.getItem('bizcalc_fomo_deadline');
    let deadline = savedDeadline ? parseInt(savedDeadline, 10) : Date.now() + 10 * 60 * 1000;
    if (!savedDeadline) localStorage.setItem('bizcalc_fomo_deadline', deadline.toString());

    const interval = setInterval(() => {
      const diff = deadline - Date.now();
      if (diff <= 0) { setTimeLeft(0); clearInterval(interval); }
      else setTimeLeft(Math.floor(diff / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
  const cardVariants = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <>
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} referralLink={referralLink} referralCode={referralCode} />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-28 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Page Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold text-primary uppercase tracking-widest mb-4"
            >
              Transparent Pricing
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight"
            >
              Choose your plan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
              className="text-base text-slate-500 leading-relaxed"
            >
              All core tools are completely free. Upgrade to remove limits and unlock the full BizCalc India experience.
            </motion.p>
          </div>

          {/* Referral Progress (logged in users) */}
          {user && !isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto mb-12 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-slate-700">Your referrals</span>
                </div>
                <span className="text-sm font-bold text-primary">{referralsCount} / 3</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((referralsCount / 3) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-primary h-2 rounded-full"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Invite {3 - referralsCount} more friend{3 - referralsCount !== 1 ? 's' : ''} to unlock Premium for 3 months.</p>
            </motion.div>
          )}

          {/* Pricing Cards */}
          <motion.div
            variants={containerVariants} initial="hidden" animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
          >

            {/* ── FREE ── */}
            <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Free</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-extrabold text-slate-800">₹0</span>
                  <span className="text-sm text-slate-400 font-medium">/ forever</span>
                </div>
                <p className="text-sm text-slate-500">Everything you need to get started.</p>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {['GST Calculator', 'Profit Margin Calculator', 'Discount Calculator', 'Basic Invoice Generator', 'Standard Support'].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <Check size={15} className="text-slate-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {!user ? (
                <button onClick={openAuthModal} className="w-full py-3 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Get Started Free
                </button>
              ) : !isPremium ? (
                <button disabled className="w-full py-3 px-4 text-sm font-semibold text-slate-400 bg-slate-50 rounded-xl cursor-not-allowed border border-slate-200">
                  Current Plan
                </button>
              ) : null}
            </motion.div>

            {/* ── PREMIUM (featured, elevated) ── */}
            <motion.div variants={cardVariants} className="relative md:-mt-4 md:-mb-4">
              {/* Most Popular Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-block bg-gradient-to-r from-primary to-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide">
                  Most Popular
                </span>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-8 flex flex-col relative overflow-hidden pt-10 shadow-2xl shadow-slate-900/30">
                {/* Subtle glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet-900/20 pointer-events-none" />

                <div className="relative mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown size={16} className="text-yellow-400" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Premium</p>
                  </div>

                  {/* FOMO Timer — clean, not overlapping */}
                  {!isPremium && timeLeft > 0 && (
                    <div className="mb-4 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <Clock size={15} className="text-red-400 shrink-0 animate-pulse" />
                      <div>
                        <p className="text-xs text-slate-400 leading-none mb-0.5">Free Premium offer ends in</p>
                        <span className="text-lg font-bold text-white font-mono">{formatTime(timeLeft)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-white">₹999</span>
                    <span className="text-sm text-slate-400 font-medium">/ year</span>
                  </div>
                  <p className="text-sm text-slate-400">Or unlock free for 3 months by referring 3 friends.</p>
                </div>

                <div className="space-y-3 mb-8 flex-1 relative">
                  {[
                    'Everything in Free',
                    'Unlimited Saved Invoices',
                    'Custom Logo on PDF Invoices',
                    'Zero Advertisements',
                    'Priority 24/7 Support',
                    'Early Access to New Tools',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check size={15} className="text-primary shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                {isPremium ? (
                  <div className="w-full py-3 px-4 bg-yellow-400/20 border border-yellow-400/30 rounded-xl text-sm font-bold text-yellow-400 text-center">
                    Active — Premium Member
                  </div>
                ) : user ? (
                  <button
                    onClick={() => setIsInviteOpen(true)}
                    className="relative w-full py-3 px-4 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                  >
                    <Users size={16} /> Invite 3 Friends — Unlock Free
                  </button>
                ) : (
                  <button
                    onClick={openAuthModal}
                    className="w-full py-3 px-4 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                  >
                    Sign In to Unlock Free
                  </button>
                )}
              </div>
            </motion.div>

            {/* ── SILVER ── */}
            <motion.div variants={cardVariants} className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600/50 p-8 flex flex-col shadow-lg">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-300 to-slate-500" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Silver</p>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-extrabold text-white">₹499</span>
                  <span className="text-sm text-slate-400 font-medium">/ year</span>
                </div>
                <p className="text-sm text-slate-400">Perfect for growing solopreneurs.</p>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {[
                  'Everything in Free',
                  'Save up to 50 Invoices',
                  'Remove Watermarks from PDFs',
                  'Export Invoices to Excel',
                  'Standard Support',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check size={15} className="text-slate-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-semibold rounded-xl transition-colors">
                Buy Silver
              </button>
            </motion.div>

          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-center text-xs text-slate-400 mt-12"
          >
            All plans include access to free tools. No credit card required to start. Cancel anytime.
          </motion.p>

        </div>
      </div>
    </>
  );
}
