const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateTax } = require('../src/utils/taxCalculator');
const Transaction = require('../src/models/Transaction');
const { getTaxEstimate } = require('../src/controllers/taxController');

test('calculates tax at and above each 2024/2025 bracket boundary', () => {
  const brackets = [
    [0, 0],
    [237100, 42678],
    [370500, 77362],
    [512800, 121475],
    [673000, 179147],
    [857900, 251258],
    [1817000, 644489]
  ];

  for (const [income, expectedTax] of brackets) {
    assert.equal(calculateTax(income), expectedTax, `tax at income ${income}`);
  }
  assert.equal(calculateTax(2000000), 726839);
});

test('rejects invalid annual income', () => {
  for (const income of [-1, NaN, Infinity, '1000']) {
    assert.throws(() => calculateTax(income), TypeError);
  }
});

test('returns the income, estimated tax, and net income for the authenticated freelancer', async () => {
  const originalFind = Transaction.find;
  let responseBody;
  let nextError;

  Transaction.find = async (filter) => {
    assert.deepEqual(filter, { freelancerId: 'freelancer-id', type: 'earning' });
    return [{ amount: 100000 }, { amount: 50000 }];
  };

  try {
    await getTaxEstimate(
      { user: { id: 'freelancer-id' } },
      { json: (body) => { responseBody = body; } },
      (error) => { nextError = error; }
    );
  } finally {
    Transaction.find = originalFind;
  }

  assert.equal(nextError, undefined);
  assert.deepEqual(responseBody, {
    totalIncome: 150000,
    estimatedTax: 27000,
    netIncome: 123000
  });
});
