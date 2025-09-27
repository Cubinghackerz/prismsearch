export const formatCurrency = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 100 ? 2 : 4,
    maximumFractionDigits: 4,
  }).format(value);
};

export const formatCompactNumber = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatPercent = (value?: number, fractionDigits = 2) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(fractionDigits)}%`;
};
