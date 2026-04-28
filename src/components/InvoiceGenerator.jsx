import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ToolCard from './ToolCard';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { formatINR } from '../utils/formatters';
import { FileText, Plus, Trash2, Download } from 'lucide-react';

export default function InvoiceGenerator({ onAction }) {
  const [data, setData] = useState({
    businessName: '',
    customerName: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    businessLogo: null,
    customerLogo: null,
    items: [{ desc: '', qty: 1, price: 0, gst: 18 }]
  });

  const handleLogoUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    setData({ ...data, items: newItems });
  };

  const addItem = () => setData({ ...data, items: [...data.items, { desc: '', qty: 1, price: 0, gst: 18 }] });
  
  const removeItem = (index) => {
    const newItems = data.items.filter((_, i) => i !== index);
    setData({ ...data, items: newItems });
  };

  const handleDownload = () => {
    onAction(); // Trigger lead capture check
    generateInvoicePDF(data);
  };

  return (
    <>
      <Helmet>
        <title>Free Business Tool Invoice Generator India | BizCalc</title>
        <meta name="description" content="Use our completely free business tool invoice generator. Easily add your logo, calculate GST automatically, and download a professional PDF invoice instantly." />
      </Helmet>
      <ToolCard 
        title="Free Invoice Generator" 
        description="Create professional invoices with automated GST breakdown."
        icon={<FileText className="w-6 h-6" />}
      >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Business Name</label>
            <input 
              type="text" 
              value={data.businessName}
              onChange={e => setData({...data, businessName: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white/50 focus:bg-white outline-none"
            />
            <label className="block text-xs font-medium text-slate-500 mt-2 mb-1">Business Logo (Optional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={e => handleLogoUpload(e, 'businessLogo')}
              className="w-full text-sm text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
            <input 
              type="text" 
              value={data.customerName}
              onChange={e => setData({...data, customerName: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white/50 focus:bg-white outline-none"
            />
            <label className="block text-xs font-medium text-slate-500 mt-2 mb-1">Customer Logo (Optional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={e => handleLogoUpload(e, 'customerLogo')}
              className="w-full text-sm text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Number</label>
            <input 
              type="text" 
              value={data.invoiceNumber}
              onChange={e => setData({...data, invoiceNumber: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white/50 focus:bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input 
              type="date" 
              value={data.date}
              onChange={e => setData({...data, date: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white/50 focus:bg-white outline-none"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex justify-between items-center">
            Line Items
            <button onClick={addItem} className="text-primary hover:text-primary/80 flex items-center text-xs">
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </button>
          </h3>
          
          <div className="space-y-4">
            {data.items.map((item, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 items-end p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs text-slate-500 mb-1">Description</label>
                  <input type="text" value={item.desc} onChange={e => updateItem(idx, 'desc', e.target.value)} className="w-full p-2 rounded-md border border-slate-200" />
                </div>
                <div className="w-16">
                  <label className="block text-xs text-slate-500 mb-1">Qty</label>
                  <input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} className="w-full p-2 rounded-md border border-slate-200 text-center" />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-slate-500 mb-1">Price</label>
                  <input type="number" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} className="w-full p-2 rounded-md border border-slate-200" />
                </div>
                <div className="w-20">
                  <label className="block text-xs text-slate-500 mb-1">GST %</label>
                  <select value={item.gst} onChange={e => updateItem(idx, 'gst', e.target.value)} className="w-full p-2 rounded-md border border-slate-200">
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
                <button onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-500" disabled={data.items.length === 1}>
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleDownload}
          className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-md shadow-primary/20 flex justify-center items-center transition-transform active:scale-95"
        >
          <Download className="w-5 h-5 mr-2" /> Download PDF Invoice
        </button>
      </div>
      </ToolCard>
    </>
  );
}
