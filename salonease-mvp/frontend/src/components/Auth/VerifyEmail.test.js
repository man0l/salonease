import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authApi } from '../../utils/api';
import VerifyEmail from './VerifyEmail';

jest.mock('../../utils/api', () => ({
  authApi: {
    verifyEmail: jest.fn(),
  },
}));

const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('VerifyEmail Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should display loading state initially', async () => {
    authApi.verifyEmail.mockImplementation(() => new Promise(() => {})); // This will cause the promise to never resolve

    await act(async () => {
      renderWithRouter(<VerifyEmail />, { route: '/verify-email?token=validtoken' });
    });

    await waitFor(() => {
      expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
    });

    expect(screen.getByRole('status')).toHaveClass('animate-spin');
  });

  it('should display success message and redirect on successful verification', async () => {
    const token = 'validtoken';
    authApi.verifyEmail.mockResolvedValueOnce({ data: { message: 'Email verified successfully. You can now log in.' } });

    await act(async () => {
      renderWithRouter(<VerifyEmail />, { route: `/verify-email?token=${token}` });
    });

    await waitFor(() => {
      expect(screen.getByText('Email verification successful')).toBeInTheDocument();
      expect(screen.getByText('Redirecting to login...')).toBeInTheDocument();
    });

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(3000);
    });
  });

  it('should display error message on failed verification', async () => {
    const token = 'invalidtoken';
    authApi.verifyEmail.mockRejectedValueOnce({ response: { data: { message: 'Invalid or expired token' } } });

    await act(async () => {
      renderWithRouter(<VerifyEmail />, { route: `/verify-email?token=${token}` });
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Go to Login' })).toBeInTheDocument();
  });

  it('should display error message for missing token', async () => {
    await act(async () => {
      renderWithRouter(<VerifyEmail />, { route: '/verify-email' });
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid verification link')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Go to Login' })).toBeInTheDocument();
  });
});
