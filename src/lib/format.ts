export const CURRENCY = 'LKR';

export const money = (n: number) =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const toCents = (n: number) => Math.round(n * 100);