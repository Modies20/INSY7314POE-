import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import App from './App';
import api from './api/axiosConfig';
import { AuthProvider } from './context/AuthContext';

vi.mock('./api/axiosConfig', () => ({
  default: { get: vi.fn() }
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

test('renders the HustleHub sign-in view', () => {
  render(<MemoryRouter initialEntries={['/login']}><AuthProvider><App /></AuthProvider></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /hustle hub/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/you@example/i)).toBeInTheDocument();
});

test('opens a dedicated tax estimate page for freelancers', async () => {
  localStorage.setItem('user', JSON.stringify({ email: 'freelancer@example.com', role: 'freelancer' }));
  api.get.mockResolvedValue({
    data: { totalIncome: 1000, estimatedTax: 180, netIncome: 820 }
  });

  render(<MemoryRouter initialEntries={['/tax']}><AuthProvider><App /></AuthProvider></MemoryRouter>);

  expect(await screen.findByRole('heading', { name: 'Your tax estimate' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Tax estimate' })).toHaveAttribute('href', '/tax');
});

test('keeps the tax estimate private to freelancers', async () => {
  localStorage.setItem('user', JSON.stringify({ email: 'client@example.com', role: 'client' }));

  render(<MemoryRouter initialEntries={['/tax']}><AuthProvider><App /></AuthProvider></MemoryRouter>);

  expect(await screen.findByRole('heading', { name: 'Good to see you, client.' })).toBeInTheDocument();
  expect(api.get).not.toHaveBeenCalled();
});
