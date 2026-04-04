export function formatPrice(price: number) {
  if (price === undefined || price === null) return "$0.00";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Forces the standard $ symbol
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}
