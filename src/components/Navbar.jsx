import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '#' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-xl">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">BizCalc<span className="text-primary">India</span></span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              link.path.startsWith('/') ? (
                <Link key={link.name} to={link.path} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">{link.name}</Link>
              ) : (
                <a key={link.name} href={link.path} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">{link.name}</a>
              )
            ))}
            <a href="#" className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 hover:opacity-80 transition-opacity">Buy Me a Coffee</a>
            <a href="https://instagram.com/we.arecc" target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">we.arecc</a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
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

      {/* Mobile Menu Dropdown */}
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
              {navLinks.map((link) => (
                link.path.startsWith('/') ? (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a 
                    key={link.name} 
                    href={link.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors"
                  >
                    {link.name}
                  </a>
                )
              ))}
              <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col space-y-3 px-3">
                <a href="#" className="inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 hover:opacity-90 transition-opacity shadow-md">
                  Buy Me a Coffee
                </a>
                <a href="https://instagram.com/we.arecc" target="_blank" rel="noreferrer" className="text-center text-sm font-medium text-slate-500 hover:text-primary transition-colors py-2">
                  Follow we.arecc
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
