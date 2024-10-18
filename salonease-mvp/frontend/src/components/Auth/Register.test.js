import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom/extend-expect';
import Register from './Register';
import { authApi } from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

jest.mock('../../utils/api', () => ({
  authApi: {
    register: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Register Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders registration form', () => {
    render(<Register />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password', { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/accept terms and conditions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    render(<Register />);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });
    
    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/confirm password is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/accept terms is required/i)).toBeInTheDocument();
  });

  test('submits form with valid inputs', async () => {
    const mockResponse = { data: { message: 'Registration successful. Please check your email to verify your account.' } };
    authApi.register.mockResolvedValueOnce(mockResponse);

    render(<Register />);
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'testuser@example.com' } });
      fireEvent.change(screen.getByLabelText('Password', { selector: 'input' }), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByLabelText('Confirm Password', { selector: 'input' }), { target: { value: 'Password123!' } });
      fireEvent.click(screen.getByLabelText(/accept terms and conditions/i));
      
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });
    
    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        fullName: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true,
      });
      expect(toast.success).toHaveBeenCalledWith(mockResponse.data.message);
      expect(mockNavigate).toHaveBeenCalledWith('/registration-success');
    });
  });

  test('handles registration error', async () => {
    const errorMessage = 'Registration failed';
    authApi.register.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    render(<Register />);
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'testuser@example.com' } });
      fireEvent.change(screen.getByLabelText('Password', { selector: 'input' }), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByLabelText('Confirm Password', { selector: 'input' }), { target: { value: 'Password123!' } });
      fireEvent.click(screen.getByLabelText(/accept terms and conditions/i));
      
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});
