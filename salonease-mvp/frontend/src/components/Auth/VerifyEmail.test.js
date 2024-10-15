import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import axios from 'axios';
import VerifyEmail from './VerifyEmail';

jest.mock('axios');

describe('VerifyEmail Component', () => {
  const history = createMemoryHistory();

  it('should display success message and redirect on successful verification', async () => {
    const token = 'validtoken';
    const location = { search: `?token=${token}` };
    axios.get.mockResolvedValueOnce({ data: { message: 'Email verified successfully. You can now log in.' } });

    render(
      <Router location={location} navigator={history}>
        <VerifyEmail />
      </Router>
    );

    expect(await screen.findByText('Email verified successfully. You can now log in.')).toBeInTheDocument();
    await waitFor(() => expect(history.location.pathname).toBe('/login'));
  });

  it('should display error message on failed verification', async () => {
    const token = 'invalidtoken';
    const location = { search: `?token=${token}` };
    axios.get.mockRejectedValueOnce({ response: { data: { message: 'Invalid or expired token' } } });

    render(
      <Router location={location} navigator={history}>
        <VerifyEmail />
      </Router>
    );

    expect(await screen.findByText('Invalid or expired token')).toBeInTheDocument();
  });

  it('should display error message for missing token', () => {
    const location = { search: '' };

    render(
      <Router location={location} navigator={history}>
        <VerifyEmail />
      </Router>
    );

    expect(screen.getByText('Invalid verification link.')).toBeInTheDocument();
  });
});
