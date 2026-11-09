import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import api from './api/axiosConfig';
import TaxDashboard from './TaxDashboard';

vi.mock('./api/axiosConfig', () => ({
  default: { get: vi.fn() }
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('displays the estimate breakdown and tax calculation information', async () => {
  api.get.mockResolvedValue({
    data: { totalIncome: 1000, estimatedTax: 180, netIncome: 820 }
  });

  render(<TaxDashboard />);

  expect(await screen.findByRole('heading', { name: 'Your tax estimate' })).toBeInTheDocument();
  expect(screen.getByText('Gross booking income')).toBeInTheDocument();
  expect(screen.getByText('Estimated tax')).toBeInTheDocument();
  expect(screen.getByText('After estimated tax')).toBeInTheDocument();
  expect(screen.getByText(/progressive income-tax brackets/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/chart comparing booking income/i)).toBeInTheDocument();
  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/tax/estimate'));
});

test('explains that estimates update after a client books a gig when there is no income', async () => {
  api.get.mockResolvedValue({
    data: { totalIncome: 0, estimatedTax: 0, netIncome: 0 }
  });

  render(<TaxDashboard />);

  expect(await screen.findByRole('heading', { name: 'No booking income yet' })).toBeInTheDocument();
  expect(screen.getByText(/when a client books one of your gigs/i)).toBeInTheDocument();
});

test('shows an error when the tax estimate cannot be loaded', async () => {
  api.get.mockRejectedValue(new Error('Request failed'));

  render(<TaxDashboard />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load your tax estimate');
});
