export const formatINR = (amount) => {
  if (isNaN(amount) || amount === null) return '₹ 0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercent = (value) => {
  if (isNaN(value) || value === null) return '0%';
  return `${Number(value).toFixed(2)}%`;
};
