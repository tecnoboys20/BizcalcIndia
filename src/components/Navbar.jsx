import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Menu, X, User, Crown, LogOut, Settings, KeyRound, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isPremium, openAuthModal, logout, resetPassword } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Blog', path: '/blog' },
  ];

  // Get display name: first part of email before @
  const displayName = user?.email?.split('@')[0] || '';
  const displayInitial = displayName.charAt(0).toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleForgotPassword = async () => {
    if (!user?.email) return;
    const { error } = await resetPassword(user.email);
    if (!error) {
      alert(`✅ Password reset email sent to ${user.email}. Check your inbox!`);
    } else {
      alert('❌ Error sending reset email: ' + error.message);
    }
    setIsUserDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-xl">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">BizCalc<span className="text-primary">India</span></span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">{link.name}</Link>
            ))}

            <div className="w-px h-6 bg-slate-200 mx-2"></div>

            {user ? (
              /* === USER AVATAR + DROPDOWN === */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200 bg-white hover:border-primary/40 hover:shadow-md transition-all duration-200"
                >
                  {/* Avatar circle with initial */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${isPremium ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-primary to-violet-600'}`}>
                    {displayInitial}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">{displayName}</span>
                  {isPremium && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl overflow-hidden"
                    >
                      {/* Profile header */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow ${isPremium ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-primary to-violet-600'}`}>
                            {displayInitial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate capitalize">{displayName}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>

                        {/* Premium / Free badge */}
                        <div className="mt-3">
                          {isPremium ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
                              <Crown className="w-3 h-3" /> Premium Member
                            </span>
                          ) : (
                            <Link
                              to="/pricing"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                            >
                              ✦ Upgrade to Premium — Free!
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={handleForgotPassword}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors text-left"
                        >
                          <KeyRound className="w-4 h-4 text-slate-400" /> Reset Password
                        </button>
                        <Link
                          to="/pricing"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" /> Account & Plan
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 py-2">
                        <button
                          onClick={() => { logout(); setIsUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-all shadow-sm hover:shadow-md"
              >
                <User className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>

          {/* Mobile: Avatar + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow ${isPremium ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-primary to-violet-600'}`}>
                {displayInitial}
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-primary focus:outline-none p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-white/95 backdrop-blur-md border-b border-white/40 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col shadow-lg">

              {/* User info block (mobile) */}
              {user && (
                <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-xl mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow ${isPremium ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-primary to-violet-600'}`}>
                    {displayInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 capitalize truncate">{displayName}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  {isPremium && <Crown className="w-4 h-4 text-yellow-500 shrink-0" />}
                </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col space-y-3 px-3">
                {user ? (
                  <>
                    {isPremium ? (
                      <div className="inline-flex items-center justify-center gap-2 text-sm font-bold text-yellow-700 bg-yellow-100 py-2.5 rounded-xl border border-yellow-200">
                        <Crown className="w-4 h-4" /> Premium Member
                      </div>
                    ) : (
                      <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary bg-primary/10 py-2.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors">
                        ✦ Upgrade to Premium — Free!
                      </Link>
                    )}
                    <button
                      onClick={() => { handleForgotPassword(); setIsMobileMenuOpen(false); }}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <KeyRound className="w-4 h-4" /> Reset Password
                    </button>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { openAuthModal(); setIsMobileMenuOpen(false); }}
                    className="inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all shadow-md"
                  >
                    <User className="w-4 h-4 mr-2" /> Sign In / Join
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
