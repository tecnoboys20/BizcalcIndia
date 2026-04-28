import { jsPDF } from "jspdf";
import { formatINR } from "./formatters";

export const generateInvoicePDF = (invoiceData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("INVOICE", 14, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice Number: ${invoiceData.invoiceNumber || 'N/A'}`, 14, 30);
  doc.text(`Date: ${invoiceData.date || new Date().toLocaleDateString()}`, 14, 35);
  
  // Business Info
  doc.setFont("helvetica", "bold");
  doc.text("From:", 14, 50);
  doc.setFont("helvetica", "normal");
  doc.text(invoiceData.businessName || 'Business Name', 14, 55);
  if(invoiceData.gstin) doc.text(`GSTIN: ${invoiceData.gstin}`, 14, 60);

  if (invoiceData.businessLogo) {
    try {
      const format = invoiceData.businessLogo.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(invoiceData.businessLogo, format, 160, 10, 30, 30);
    } catch(e) { console.error("Error adding business logo", e); }
  }
  
  // Customer Info
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 120, 50);
  doc.setFont("helvetica", "normal");
  doc.text(invoiceData.customerName || 'Customer Name', 120, 55);

  if (invoiceData.customerLogo) {
    try {
      const format = invoiceData.customerLogo.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(invoiceData.customerLogo, format, 160, 48, 25, 25);
    } catch(e) { console.error("Error adding customer logo", e); }
  }
  
  // Line items header
  doc.setLineWidth(0.5);
  doc.line(14, 75, 196, 75);
  doc.setFont("helvetica", "bold");
  doc.text("Item", 14, 82);
  doc.text("Qty", 100, 82);
  doc.text("Price/Unit", 130, 82);
  doc.text("GST %", 160, 82);
  doc.text("Total", 196, 82, { align: "right" });
  doc.line(14, 86, 196, 86);
  
  let y = 94;
  doc.setFont("helvetica", "normal");
  let subtotal = 0;
  let totalGst = 0;
  let finalTotal = 0;
  
  (invoiceData.items || []).forEach(item => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    const gstRate = parseFloat(item.gst) || 0;
    
    const itemTotal = qty * price;
    const itemGst = itemTotal * (gstRate / 100);
    const itemFinal = itemTotal + itemGst;
    
    subtotal += itemTotal;
    totalGst += itemGst;
    finalTotal += itemFinal;
    
    doc.text(String(item.desc || 'Item'), 14, y);
    doc.text(String(qty), 100, y);
    doc.text(formatINR(price), 130, y);
    doc.text(`${gstRate}%`, 160, y);
    doc.text(formatINR(itemFinal), 196, y, { align: "right" });
    y += 8;
  });
  
  // Totals
  doc.line(14, y + 5, 196, y + 5);
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Subtotal:", 140, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatINR(subtotal), 196, y, { align: "right" });
  
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Total GST:", 140, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatINR(totalGst), 196, y, { align: "right" });
  
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Final Total:", 140, y);
  doc.setFont("helvetica", "bold");
  doc.text(formatINR(finalTotal), 196, y, { align: "right" });
  
  doc.save(`Invoice_${invoiceData.invoiceNumber || 'draft'}.pdf`);
};
