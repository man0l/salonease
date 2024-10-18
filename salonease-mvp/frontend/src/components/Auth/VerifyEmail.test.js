import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
  it('should display success message and redirect on successful verification', async () => {
    const token = 'validtoken';
    authApi.verifyEmail.mockResolvedValueOnce({ data: { message: 'Email verified successfully. You can now log in.' } });

    renderWithRouter(<VerifyEmail />, { route: `/verify-email?token=${token}` });

    expect(await screen.findByText('Email verified successfully. You can now log in.')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/redirecting to login/i)).toBeInTheDocument();
    }, { timeout: 3500 });
  });

  it('should display error message on failed verification', async () => {
    const token = 'invalidtoken';
    authApi.verifyEmail.mockRejectedValueOnce({ response: { data: { message: 'Invalid or expired token' } } });

    renderWithRouter(<VerifyEmail />, { route: `/verify-email?token=${token}` });

    expect(await screen.findByText('Invalid or expired token')).toBeInTheDocument();
  });

  it('should display error message for missing token', async () => {
    renderWithRouter(<VerifyEmail />, { route: '/verify-email' });

    expect(await screen.findByText('Invalid verification link.')).toBeInTheDocument();
  });
});
