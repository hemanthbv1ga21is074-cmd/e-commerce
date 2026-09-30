/**
 * Integer Paise Money Utilities
 * Rule: Zero floating point calculations for currency.
 */

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Calculates embedded GST from inclusive retail price in paise.
 * Formula: GST = round((Price * Rate) / (100 + Rate))
 */
export function calculateGstInPaise(inclusivePriceInPaise: number, gstRatePercent = 5): number {
  return Math.round((inclusivePriceInPaise * gstRatePercent) / (100 + gstRatePercent));
}

/**
 * Formats paise into Indian Rupee representation (e.g. ₹1,299).
 */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}
