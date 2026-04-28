import React from 'react';
import { motion } from 'framer-motion';

export default function ToolCard({ title, description, icon, children }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-panel rounded-3xl p-6 sm:p-8 w-full max-w-2xl mx-auto backdrop-blur-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      <div className="flex items-center space-x-4 mb-6 relative z-10">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/10 shadow-sm text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
