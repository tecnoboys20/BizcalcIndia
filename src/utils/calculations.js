// 1. GST Calculator
export const calculateGST = (amount, rate, type = 'add') => {
  const numAmount = parseFloat(amount) || 0;
  const numRate = parseFloat(rate) || 0;
  
  if (type === 'add') {
    const gstAmount = numAmount * (numRate / 100);
    const finalAmount = numAmount + gstAmount;
    return { baseAmount: numAmount, gstAmount, finalAmount };
  } else {
    // Remove GST
    const baseAmount = numAmount / (1 + (numRate / 100));
    const gstAmount = numAmount - baseAmount;
    return { baseAmount, gstAmount, finalAmount: numAmount };
  }
};

// 2. Profit Margin Calculator
export const calculateProfit = (cost, sellingPrice) => {
  const numCost = parseFloat(cost) || 0;
  const numSP = parseFloat(sellingPrice) || 0;
  
  const profit = numSP - numCost;
  const margin = numSP > 0 ? (profit / numSP) * 100 : 0;
  const markup = numCost > 0 ? (profit / numCost) * 100 : 0;
  
  return { profit, margin, markup };
};

// 3. Discount Calculator
export const calculateDiscount = (originalPrice, discountPercent) => {
  const numPrice = parseFloat(originalPrice) || 0;
  const numDisc = parseFloat(discountPercent) || 0;
  
  const savings = numPrice * (numDisc / 100);
  const finalPrice = numPrice - savings;
  
  return { savings, finalPrice };
};

// 4. Pricing Calculator
export const calculatePricing = (cost, shipping, misc, targetMargin, gst) => {
  const numCost = parseFloat(cost) || 0;
  const numShip = parseFloat(shipping) || 0;
  const numMisc = parseFloat(misc) || 0;
  const numMargin = parseFloat(targetMargin) || 0;
  const numGst = parseFloat(gst) || 0;
  
  const totalCost = numCost + numShip + numMisc;
  // Margin is based on final price before GST. 
  // Selling Price = Cost / (1 - Margin%)
  const sellingPriceBeforeGST = numMargin < 100 ? totalCost / (1 - (numMargin / 100)) : totalCost;
  const estimatedProfit = sellingPriceBeforeGST - totalCost;
  const finalGST = sellingPriceBeforeGST * (numGst / 100);
  const recommendedPrice = sellingPriceBeforeGST + finalGST;
  
  return { totalCost, estimatedProfit, sellingPriceBeforeGST, finalGST, recommendedPrice };
};

// 5. Break-Even Calculator
export const calculateBreakEven = (fixedCost, variableCost, sellingPrice) => {
  const numFC = parseFloat(fixedCost) || 0;
  const numVC = parseFloat(variableCost) || 0;
  const numSP = parseFloat(sellingPrice) || 0;
  
  const contributionMargin = numSP - numVC;
  const breakEvenUnits = contributionMargin > 0 ? numFC / contributionMargin : 0;
  const breakEvenRevenue = breakEvenUnits * numSP;
  
  return { contributionMargin, breakEvenUnits: Math.ceil(breakEvenUnits), breakEvenRevenue };
};

// 6. Freelance Rate Calculator
export const calculateFreelanceRate = (incomeGoal, expenses, billableHoursWeek, weeksPerYear) => {
  const numGoal = parseFloat(incomeGoal) || 0;
  const numExp = parseFloat(expenses) || 0;
  const numHours = parseFloat(billableHoursWeek) || 0;
  const numWeeks = parseFloat(weeksPerYear) || 52;
  
  const totalNeeded = numGoal + numExp;
  const totalHours = numHours * numWeeks;
  
  const hourlyRate = totalHours > 0 ? (totalNeeded / totalHours) : 0;
  const dailyRate = hourlyRate * (numHours / 5); // Assuming 5 work days
  
  return { hourlyRate, dailyRate, totalHours };
};
