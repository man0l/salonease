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

  test('maintains authentication when navigating to dashboard after login', async () => {
    // Mock successful login and user state
    const mockUser = { id: '1', role: 'SalonOwner', onboardingCompleted: true };
    const mockLogin = jest.fn().mockResolvedValue(true);
    const mockNavigate = jest.fn();
    
    // Mock useAuth to simulate authenticated state
    jest.spyOn(require('../../hooks/useAuth'), 'useAuth').mockImplementation(() => ({
      login: mockLogin,
      user: mockUser,
      loading: false,
      isAuthenticated: true
    }));

    // Mock useNavigate and useLocation
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    jest.spyOn(require('react-router-dom'), 'useLocation').mockImplementation(() => ({
      pathname: '/dashboard'
    }));

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    });
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'refreshToken') return 'mock-refresh-token';
      return null;
    });

    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    // Perform login
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(signInButton);
    });

    // Verify initial navigation to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    // Simulate manual navigation to dashboard
    await act(async () => {
      // Update location pathname
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true
      });
    });

    // Verify we're still on dashboard and not redirected to login
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalledWith('/login');
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
