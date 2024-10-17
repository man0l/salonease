import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { toast } from 'react-toastify';
import ForgotPassword from './ForgotPassword';
import { authApi } from '../../utils/api';

// Mock the authApi and toast
jest.mock('../../utils/api', () => ({
  authApi: {
    forgotPassword: jest.fn(),
  },
}));
jest.mock('react-toastify');

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    render(
      <Router>
        <ForgotPassword />
      </Router>
    );
  });

  it('renders the forgot password form', () => {
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
  });

  it('displays an error message for invalid email', async () => {
    const emailInput = screen.getByLabelText('Email address');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('submits the form with valid email', async () => {
    const emailInput = screen.getByLabelText('Email address');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    authApi.forgotPassword.mockResolvedValueOnce({ data: { message: 'Reset link sent' } });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authApi.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(toast.success).toHaveBeenCalledWith('Reset link sent');
    });
  });

  it('handles API error', async () => {
    const emailInput = screen.getByLabelText('Email address');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    authApi.forgotPassword.mockRejectedValueOnce({ response: { data: { message: 'User not found' } } });

    fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('User not found');
    });
  });
});
