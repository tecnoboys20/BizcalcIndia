import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute -top-24 -left-12 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-12 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Free Business Tool &<br/>Invoice Generator <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">India</span>
          </h1>
          <h2 className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            Your all-in-one free calculator toolkit. Calculate GST, discover your exact profit margin, apply discounts, and use our free business tool invoice generator instantly.
          </h2>
          <div className="flex justify-center flex-wrap gap-4 text-sm font-medium text-slate-600">
            <span className="flex items-center glass-panel px-4 py-2 rounded-full shadow-sm"><span className="text-accent mr-2">✓</span> 100% Free Calculator</span>
            <span className="flex items-center glass-panel px-4 py-2 rounded-full shadow-sm"><span className="text-accent mr-2">✓</span> No Signup Required</span>
            <span className="flex items-center glass-panel px-4 py-2 rounded-full shadow-sm"><span className="text-primary mr-2">★</span> Built for Indian Businesses</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
