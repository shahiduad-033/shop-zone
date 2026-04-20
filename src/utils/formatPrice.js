export const formatPrice = (price, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: 2,
  }).format(price);

export const truncateText = (text = '', max = 100) =>
  text.length <= max ? text : text.substring(0, max) + '…';

export const calculateDiscount = (original, sale) =>
  Math.round(((original - sale) / original) * 100);