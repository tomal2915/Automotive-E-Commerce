// Centralized currency formatting — the ONLY place that decides how a
// price is displayed. If the business ever needs to change currency or
// add multi-currency support, this is the only file that changes.
export const formatCurrency = (amount: number): string => {
  return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
