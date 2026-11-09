const calculateTax = (annualIncome) => {
  if (typeof annualIncome !== 'number' || !Number.isFinite(annualIncome) || annualIncome < 0) {
    throw new TypeError('Annual income must be a non-negative finite number');
  }

  if (annualIncome <= 237100) return annualIncome * 0.18;
  if (annualIncome <= 370500) return 42678 + (annualIncome - 237100) * 0.26;
  if (annualIncome <= 512800) return 77362 + (annualIncome - 370500) * 0.31;
  if (annualIncome <= 673000) return 121475 + (annualIncome - 512800) * 0.36;
  if (annualIncome <= 857900) return 179147 + (annualIncome - 673000) * 0.39;
  if (annualIncome <= 1817000) return 251258 + (annualIncome - 857900) * 0.41;
  return 644489 + (annualIncome - 1817000) * 0.45;
};

module.exports = { calculateTax };
