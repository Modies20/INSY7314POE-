import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

test('renders the HustleHub sign-in view', () => {
  render(<MemoryRouter initialEntries={['/login']}><AuthProvider><App /></AuthProvider></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /hustle hub/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/you@example/i)).toBeInTheDocument();
});
