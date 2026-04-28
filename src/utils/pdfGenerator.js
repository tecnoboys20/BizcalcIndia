import { jsPDF } from "jspdf";
import { formatINR } from "./formatters";

const formatPDFCurrency = (amount) => {
  return formatINR(amount).replace(/₹/g, 'Rs.');
};

export const generateInvoicePDF = (invoiceData) => {
  const doc = new jsPDF();
  
  let currentY = 20;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  if (invoiceData.businessName) {
    doc.text(invoiceData.businessName.toUpperCase(), 14, currentY);
    currentY += 8;
    doc.setFontSize(14);
    doc.text("INVOICE", 14, currentY);
    currentY += 10;
  } else {
    doc.text("INVOICE", 14, currentY);
    currentY += 10;
  }
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice Number: ${invoiceData.invoiceNumber || 'N/A'}`, 14, currentY);
  currentY += 5;
  doc.text(`Date: ${invoiceData.date || new Date().toLocaleDateString()}`, 14, currentY);
  currentY += 15;
  
  let businessY = currentY;
  let customerY = currentY;

  // Business Info
  doc.setFont("helvetica", "bold");
  doc.text("From:", 14, businessY);
  businessY += 5;
  doc.setFont("helvetica", "normal");
  doc.text(invoiceData.businessName || 'Business Name', 14, businessY);
  businessY += 5;
  
  if (invoiceData.businessAddress) {
    const splitAddress = doc.splitTextToSize(invoiceData.businessAddress, 80);
    doc.text(splitAddress, 14, businessY);
    businessY += (splitAddress.length * 5);
  }
  if (invoiceData.businessPhone) {
    doc.text(`Contact: ${invoiceData.businessPhone}`, 14, businessY);
    businessY += 5;
  }
  if (invoiceData.gstin) {
    doc.text(`GSTIN: ${invoiceData.gstin}`, 14, businessY);
    businessY += 5;
  }

  // Customer Info
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 120, customerY);
  customerY += 5;
  doc.setFont("helvetica", "normal");
  doc.text(invoiceData.customerName || 'Customer Name', 120, customerY);
  customerY += 5;

  // Logos
  if (invoiceData.businessLogo) {
    try {
      const format = invoiceData.businessLogo.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(invoiceData.businessLogo, format, 160, 10, 30, 30);
    } catch(e) { console.error("Error adding business logo", e); }
  }
  if (invoiceData.customerLogo) {
    try {
      const format = invoiceData.customerLogo.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(invoiceData.customerLogo, format, 160, Math.max(50, customerY), 25, 25);
    } catch(e) { console.error("Error adding customer logo", e); }
  }

  // Table Start
  let tableStartY = Math.max(businessY, customerY) + 10;
  if (tableStartY < 85) tableStartY = 85;

  // Line items header
  doc.setLineWidth(0.5);
  doc.line(14, tableStartY, 196, tableStartY);
  doc.setFont("helvetica", "bold");
  doc.text("Item", 14, tableStartY + 7);
  doc.text("Qty", 100, tableStartY + 7);
  doc.text("Price/Unit", 130, tableStartY + 7);
  doc.text("GST %", 160, tableStartY + 7);
  doc.text("Total", 196, tableStartY + 7, { align: "right" });
  doc.line(14, tableStartY + 11, 196, tableStartY + 11);
  
  let y = tableStartY + 19;
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
    doc.text(formatPDFCurrency(price), 130, y);
    doc.text(`${gstRate}%`, 160, y);
    doc.text(formatPDFCurrency(itemFinal), 196, y, { align: "right" });
    y += 8;
  });
  
  // Totals
  doc.line(14, y + 5, 196, y + 5);
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Subtotal:", 140, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatPDFCurrency(subtotal), 196, y, { align: "right" });
  
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Total GST:", 140, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatPDFCurrency(totalGst), 196, y, { align: "right" });
  
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Final Total:", 140, y);
  doc.setFont("helvetica", "bold");
  doc.text(formatPDFCurrency(finalTotal), 196, y, { align: "right" });
  
  doc.save(`Invoice_${invoiceData.invoiceNumber || 'draft'}.pdf`);
};
