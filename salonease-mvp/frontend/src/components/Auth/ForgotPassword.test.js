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
    jest.clearAllMocks();
  });

  it('renders the forgot password form', () => {
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('displays an error message for empty email', async () => {
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('displays an error message for invalid email', async () => {
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid email and shows success message', async () => {
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    authApi.forgotPassword.mockResolvedValueOnce({ data: { message: 'Reset link sent' } });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authApi.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(toast.success).toHaveBeenCalledWith('Reset link sent');
    });
  });

  it('handles API error and displays error message', async () => {
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    authApi.forgotPassword.mockRejectedValueOnce({ 
      response: { data: { message: 'User not found' } } 
    });

    fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('User not found');
    });
  });

  it('disables submit button while submitting', async () => {
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    authApi.forgotPassword.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
