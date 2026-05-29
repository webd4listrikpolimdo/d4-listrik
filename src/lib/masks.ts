/**
 * Utility functions for input masking/formatting.
 */

export function maskNip(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 18);
  const parts = [];
  if (digits.length > 0) parts.push(digits.slice(0, 8));
  if (digits.length > 8) parts.push(digits.slice(8, 14));
  if (digits.length > 14) parts.push(digits.slice(14, 15));
  if (digits.length > 15) parts.push(digits.slice(15, 18));
  return parts.join(" ");
}

export function maskNidn(val: string): string {
  // NIDN is 10 digits
  return val.replace(/\D/g, "").slice(0, 10);
}

export function maskPhone(val: string): string {
  // E.g. 0812-3456-7890
  const digits = val.replace(/\D/g, "").slice(0, 13);
  const parts = [];
  if (digits.length > 0) parts.push(digits.slice(0, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));
  if (digits.length > 8) parts.push(digits.slice(8, 13));
  return parts.join("-");
}
