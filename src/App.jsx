import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GSTCalculator from './components/calculators/GSTCalculator';
import ProfitCalculator from './components/calculators/ProfitCalculator';
import DiscountCalculator from './components/calculators/DiscountCalculator';
import InvoiceGenerator from './components/InvoiceGenerator';
import LeadCaptureModal from './components/LeadCaptureModal';
import FAQ from './components/FAQ';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import PreviewPage from './pages/PreviewPage';
import PricingPage from './pages/PricingPage';
import { AuthProvider } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';

function App() {
  const [activeTab, setActiveTab] = useState('gst');
  const [calcCount, setCalcCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Trigger lead capture logic
  const handleCalculateTrigger = () => {
    const newCount = calcCount + 1;
    setCalcCount(newCount);
    
    // Trigger modal after 2 calculations
    if (newCount === 2) {
      setTimeout(() => setIsModalOpen(true), 1500);
    }
  };

  const tabs = [
    { id: 'gst', label: 'GST Calculator' },
    { id: 'profit', label: 'Profit Margin' },
    { id: 'discount', label: 'Discount' },
    { id: 'invoice', label: 'Invoice Generator' },
    { id: 'more', label: 'More Tools Coming Soon...', disabled: true },
  ];

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background relative selection:bg-primary/30">
        <Navbar />
        <AuthModal />
      
      <Routes>
        {/* Home */}
        <Route path="/" element={
          <main className="pb-24">
            <Hero />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
              {/* Tool Navigation */}
              <div className="flex overflow-x-auto hide-scrollbar space-x-2 p-2 bg-slate-200/50 backdrop-blur-xl rounded-2xl mb-8 border border-white/40">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    className={`whitespace-nowrap px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      tab.disabled
                        ? 'text-primary animate-pulse bg-primary/10 cursor-default'
                        : activeTab === tab.id 
                        ? 'bg-white text-primary shadow-sm scale-100' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/40 scale-95'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Active Tool Area */}
              <div className="min-h-[400px]">
                {activeTab === 'gst' && <GSTCalculator onCalculate={handleCalculateTrigger} />}
                {activeTab === 'profit' && <ProfitCalculator onCalculate={handleCalculateTrigger} />}
                {activeTab === 'discount' && <DiscountCalculator onCalculate={handleCalculateTrigger} />}
                {activeTab === 'invoice' && <InvoiceGenerator onAction={handleCalculateTrigger} />}
              </div>
            </div>

            <FAQ activeTab={activeTab} />
          </main>
        } />

        {/* Blog */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        
        {/* Pricing */}
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} BizCalc India. Free tools for Indian entrepreneurs.</p>
        </div>
      </footer>

      <LeadCaptureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        toolUsed={activeTab}
      />
    </div>
    </AuthProvider>
  );
}

export default App;
