const Transaction = require('../models/Transaction');
const { calculateTax } = require('../utils/taxCalculator');

exports.getTaxEstimate = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      freelancerId: req.user.id,
      type: 'earning'
    });
    const totalIncome = transactions.reduce((total, transaction) => total + transaction.amount, 0);
    const estimatedTax = calculateTax(totalIncome);

    return res.json({
      totalIncome,
      estimatedTax,
      netIncome: totalIncome - estimatedTax
    });
  } catch (error) {
    return next(error);
  }
};
