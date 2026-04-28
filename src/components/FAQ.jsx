import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQ({ activeTab }) {
  const [openIndex, setOpenIndex] = useState(null);

  // Reset accordion when switching tabs
  useEffect(() => {
    setOpenIndex(null);
  }, [activeTab]);

  const faqData = {
    gst: [
      {
        question: "How do I calculate GST in India?",
        answer: "To calculate GST, multiply your base amount by the GST rate (5%, 12%, 18%, or 28%). For example, an 18% GST on ₹1,000 is calculated as 1000 * 0.18 = ₹180. Our free GST calculator does this instantly."
      },
      {
        question: "What is CGST, SGST, and IGST?",
        answer: "CGST is Central GST and SGST is State GST, which apply to intra-state sales. IGST is Integrated GST, applied to inter-state sales. Our tool calculates the total GST which you can divide equally for CGST/SGST depending on your state."
      },
      {
        question: "Is this GST calculator 100% free to use?",
        answer: "Yes! Our GST calculator is 100% free forever. There are no hidden fees, no sign-ups required, and no limits on how many times you can use it for your business."
      }
    ],
    profit: [
      {
        question: "What is a good profit margin for an Indian small business?",
        answer: "A good net profit margin generally ranges from 10% to 20%, depending on the industry. Retail usually operates on lower margins, while SaaS and professional services can see margins above 20%."
      },
      {
        question: "What is the difference between markup and margin?",
        answer: "Margin is the percentage of the selling price that is profit, while markup is the percentage of the cost price that is added to get the selling price. Our calculator shows you both instantly so you can price perfectly."
      },
      {
        question: "Is this profit margin calculator 100% free?",
        answer: "Absolutely! The BizCalc Profit Margin tool is 100% free. You can calculate your net profit, gross margin, and markup without paying a single rupee or signing up."
      }
    ],
    discount: [
      {
        question: "How do you calculate a discount percentage?",
        answer: "To find the discount amount, multiply the original price by the discount percentage divided by 100. Then subtract that from the original price to get the final price."
      },
      {
        question: "How do I calculate multiple successive discounts?",
        answer: "For successive discounts (like 20% off plus another 10% off), you apply the first discount, then apply the second discount to the new lower price, not the original price."
      },
      {
        question: "Is this discount calculator 100% free?",
        answer: "Yes, this discount calculator is 100% free. You can use it endlessly to find exactly how much you are saving on your purchases or setting discounted prices for your store."
      }
    ],
    invoice: [
      {
        question: "How does the free invoice generator work?",
        answer: "Our free business tool invoice generator allows you to add your business name, customer details, unlimited line items, and dynamic GST percentages. It instantly calculates the totals and outputs a professional PDF invoice that you can download immediately."
      },
      {
        question: "Can I add my own business logo to the invoice?",
        answer: "Yes! You can upload both your business logo and your customer's logo directly into the generator. It will automatically format them beautifully onto the final PDF."
      },
      {
        question: "Is this invoice generator actually 100% free?",
        answer: "Yes, it is 100% free. Unlike other platforms that charge per invoice or forcefully add a watermark, our invoice generator lets you create and download unlimited PDFs without any cost, paywalls, or registration."
      }
    ]
  };

  const faqs = faqData[activeTab] || faqData['gst'];

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
