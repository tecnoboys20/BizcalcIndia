import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I calculate GST in India?",
      answer: "To calculate GST, multiply your base amount by the GST rate (5%, 12%, 18%, or 28%). For example, an 18% GST on ₹1,000 is calculated as 1000 * 0.18 = ₹180. Our free GST calculator does this instantly."
    },
    {
      question: "What is a good profit margin for an Indian small business?",
      answer: "A good net profit margin for Indian small businesses generally ranges from 10% to 20%, depending on the industry. Retail usually operates on lower margins, while SaaS and professional services can see margins above 20%. Use our profit margin calculator to accurately track yours."
    },
    {
      question: "How does the free invoice generator work?",
      answer: "Our free business tool invoice generator allows you to add your business name, customer details, unlimited line items, and dynamic GST percentages. It instantly calculates the totals and outputs a professional PDF invoice that you can download immediately."
    },
    {
      question: "Is this business toolkit really 100% free?",
      answer: "Yes! BizCalc India provides these premium tools absolutely free with no sign-up required. We built this to help Indian entrepreneurs, freelancers, and small business owners operate more efficiently."
    }
  ];

  // Schema.org FAQPage Structured Data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20 mt-8">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      <div className="glass-panel rounded-3xl p-6 sm:p-10 backdrop-blur-xl border-white/40">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`border border-slate-200/60 rounded-2xl overflow-hidden transition-colors duration-300 ${openIndex === idx ? 'bg-white/60 shadow-sm border-primary/20' : 'bg-transparent hover:bg-white/40'}`}
            >
              <button 
                onClick={() => toggleFAQ(idx)}
                className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
              >
                <h3 className={`text-lg font-bold transition-colors ${openIndex === idx ? 'text-primary' : 'text-slate-800'}`}>
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === idx ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className={`flex-shrink-0 ml-4 p-1 rounded-full ${openIndex === idx ? 'bg-primary/10 text-primary' : 'text-slate-400'}`}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-slate-600 leading-relaxed text-sm sm:text-base border-t border-slate-100/50 mt-1 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
