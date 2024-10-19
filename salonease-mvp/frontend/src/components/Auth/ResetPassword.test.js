import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { toast } from 'react-toastify';
import ResetPassword from './ResetPassword';
import { authApi } from '../../utils/api';

// Mock the authApi, toast, and useNavigate
jest.mock('../../utils/api', () => ({
  authApi: {
    resetPassword: jest.fn(),
  },
}));
jest.mock('react-toastify');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    search: '?token=testtoken123',
  }),
}));

describe('ResetPassword Component', () => {
  beforeEach(() => {
    render(
      <Router>
        <ResetPassword />
      </Router>
    );
  });

  it('renders the reset password form', () => {
    expect(screen.getByRole('heading', { name: /reset your password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm new password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('displays an error message for password mismatch', async () => {
    const newPasswordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm new password$/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(newPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords must match')).toBeInTheDocument();
    });
  });

  it('submits the form with valid passwords', async () => {
    const newPasswordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm new password$/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    authApi.resetPassword.mockResolvedValueOnce({ data: { message: 'Password reset successful' } });

    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authApi.resetPassword).toHaveBeenCalledWith('testtoken123', 'NewPassword123!');
      expect(toast.success).toHaveBeenCalledWith('Password reset successful');
    });
  });

  it('handles API error', async () => {
    const newPasswordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm new password$/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    authApi.resetPassword.mockRejectedValueOnce({ response: { data: { message: 'Invalid or expired token' } } });

    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid or expired token');
    });
  });
});
