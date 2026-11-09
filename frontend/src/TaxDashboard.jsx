import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from './api/axiosConfig';

const formatCurrency = (amount) => new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 2
}).format(amount);

export default function TaxDashboard() {
  const [taxData, setTaxData] = useState(null);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    api.get('/tax/estimate')
      .then(({ data }) => {
        if (active) setTaxData(data);
      })
      .catch(() => {
        if (active) setError('Could not load your tax estimate. Please try again.');
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const hasEarnings = taxData && taxData.totalIncome > 0;
  const chartData = hasEarnings ? [{
    name: 'Your estimate',
    Income: taxData.totalIncome,
    Tax: taxData.estimatedTax,
    'After estimated tax': taxData.netIncome
  }] : [];
  const effectiveRate = hasEarnings
    ? ((taxData.estimatedTax / taxData.totalIncome) * 100).toFixed(1)
    : '0.0';

  return (
    <section className="tax-page" aria-labelledby="tax-estimate-heading">
      <p className="eyebrow">FREELANCER FINANCES · SARS 2024/25 BRACKETS</p>
      <h1 id="tax-estimate-heading">Your tax estimate</h1>
      <p className="lede">
        Review income recorded from client bookings, estimated tax, and what remains after tax.
      </p>

      {error && (
        <div className="tax-message error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => {
            setError('');
            setRetryCount(count => count + 1);
          }}>Try again</button>
        </div>
      )}

      {!taxData && !error && <p className="muted" role="status">Loading your tax estimate…</p>}

      {taxData && (
        <>
          <div className="tax-summary">
            <div><span>Gross booking income</span><strong>{formatCurrency(taxData.totalIncome)}</strong></div>
            <div><span>Estimated tax</span><strong>{formatCurrency(taxData.estimatedTax)}</strong></div>
            <div><span>After estimated tax</span><strong>{formatCurrency(taxData.netIncome)}</strong></div>
          </div>

          {hasEarnings ? (
            <div className="tax-results">
              <div className="tax-chart" aria-label="Chart comparing booking income, estimated tax, and income after estimated tax">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 16, right: 12, left: 12, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={value => formatCurrency(value)} />
                    <Tooltip formatter={value => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Income" fill="#4CAF50" />
                    <Bar dataKey="Tax" fill="#F44336" />
                    <Bar dataKey="After estimated tax" fill="#568b53" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="tax-rate">Estimated effective tax rate: <strong>{effectiveRate}%</strong></p>
            </div>
          ) : (
            <div className="tax-empty">
              <h2>No booking income yet</h2>
              <p>When a client books one of your gigs, the booking is recorded as income and your estimate will update here.</p>
            </div>
          )}

          <div className="tax-explanation">
            <h2>How this estimate is calculated</h2>
            <p>
              The estimate applies the SARS 2024/25 progressive income-tax brackets to the total
              earning transactions recorded for your bookings. The effective rate is estimated tax
              divided by gross booking income.
            </p>
            <p>
              This is a planning estimate, not tax advice. It does not account for tax-year dates,
              rebates, credits, deductions, or other income.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
