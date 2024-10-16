import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from './Login';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Login Component', () => {
  const renderLogin = () => {
    render(
      <Router>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </Router>
    );
  };

  test('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('displays error messages for invalid inputs', async () => {
    renderLogin();
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('displays error message for invalid email format', async () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  // Add more tests as needed, e.g., for successful login, API errors, etc.
});
