import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('✅ Account created! Check your email to confirm, then sign in.');
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          {/* Full-screen Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 99998,
            }}
          />

          {/* Flex overlay — guaranteed center */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '1rem',
              pointerEvents: 'none',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                pointerEvents: 'all',
                width: '100%',
                maxWidth: '24rem',
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(24px)',
                borderRadius: '1.75rem',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 30px 60px -10px rgba(0,0,0,0.2)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '2.25rem 1.75rem', position: 'relative' }}>
                {/* Close */}
                <button
                  onClick={closeAuthModal}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem', borderRadius: '9999px', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>
                    {isLogin ? '👋 Welcome Back' : '🚀 Create Account'}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    {isLogin ? 'Sign in to access your account' : 'Join free to unlock premium features!'}
                  </p>
                </div>

                {/* Error / Success */}
                {error && (
                  <div style={{ marginBottom: '1rem', padding: '0.7rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', color: '#dc2626', fontSize: '0.85rem', textAlign: 'center' }}>
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div style={{ marginBottom: '1rem', padding: '0.7rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', color: '#16a34a', fontSize: '0.85rem', textAlign: 'center' }}>
                    {successMsg}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderRadius: '0.875rem', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min. 6 chars)"
                      style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderRadius: '0.875rem', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontWeight: 700, borderRadius: '0.875rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: loading ? 0.7 : 1, marginTop: '0.25rem', boxShadow: '0 4px 14px rgba(79,70,229,0.35)', fontFamily: 'inherit' }}
                  >
                    {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Free Account'}
                  </button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
                  <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>or</span>
                  <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                </div>

                {/* Google — greyed until OAuth configured in Supabase dashboard */}
                <button
                  disabled
                  title="Enable Google provider in your Supabase dashboard to activate this"
                  style={{ width: '100%', padding: '0.8rem', background: '#f8fafc', color: '#94a3b8', fontWeight: 600, borderRadius: '0.875rem', border: '1.5px solid #e2e8f0', cursor: 'not-allowed', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontFamily: 'inherit' }}
                >
                  <svg style={{ width: '1.1rem', height: '1.1rem' }} viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#CBD5E1"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#CBD5E1"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#CBD5E1"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#CBD5E1"/>
                  </svg>
                  Google Sign-In (Coming Soon)
                </button>

                {/* Toggle */}
                <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b', margin: '1.25rem 0 0' }}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
                    style={{ color: '#4f46e5', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}
                  >
                    {isLogin ? 'Sign up free →' : 'Sign in →'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
