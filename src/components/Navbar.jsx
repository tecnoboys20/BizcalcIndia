import React from 'react';
import { Calculator } from 'lucide-react';

export default function Navbar() {
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
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Home</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Services</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Tools</a>
            <a href="#" className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 hover:opacity-80 transition-opacity">Buy Me a Coffee</a>
            <a href="https://instagram.com/we.arecc" target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">we.arecc</a>
          </div>
        </div>
      </div>
    </nav>
  );
}
