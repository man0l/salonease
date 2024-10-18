import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from './Login';
import { toast } from 'react-toastify';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}));

describe('Login Component', () => {
  const renderLogin = () => {
    return render(
      <Router>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </Router>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('displays error messages for invalid inputs', async () => {
    renderLogin();
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.click(signInButton);
    });

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  test('displays error message for invalid email format', async () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
      fireEvent.click(signInButton);
    });

    expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
  });

  test('calls login function and shows success toast on successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue(true);
    jest.spyOn(require('../../hooks/useAuth'), 'useAuth').mockImplementation(() => ({
      login: mockLogin,
    }));

    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(signInButton);
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(toast.success).toHaveBeenCalledWith('Login successful');
    });
  });

  test('shows error toast on failed login', async () => {
    const mockLogin = jest.fn().mockResolvedValue(false);
    jest.spyOn(require('../../hooks/useAuth'), 'useAuth').mockImplementation(() => ({
      login: mockLogin,
    }));

    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(signInButton);
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password');
    });
  });
});
