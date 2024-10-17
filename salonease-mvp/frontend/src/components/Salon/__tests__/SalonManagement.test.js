import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SalonManagement from '../SalonManagement';
import { useSalon } from '../../../hooks/useSalon';
import { toast } from 'react-toastify';

jest.mock('../../../hooks/useSalon');
jest.mock('react-toastify');

describe('SalonManagement', () => {
  beforeEach(() => {
    useSalon.mockReturnValue({
      salons: [],
      loading: false,
      error: null,
      addSalon: jest.fn(),
      updateSalon: jest.fn(),
      deleteSalon: jest.fn(),
    });
  });

  it('renders the form and salon list', () => {
    render(<SalonManagement />);
    expect(screen.getByText('Add New Salon')).toBeInTheDocument();
    expect(screen.getByText('Your Salons')).toBeInTheDocument();
  });

  it('adds a new salon', async () => {
    const addSalon = jest.fn().mockResolvedValue({ id: 1, name: 'Test Salon' });
    useSalon.mockReturnValue({
      salons: [],
      loading: false,
      error: null,
      addSalon,
    });

    render(<SalonManagement />);

    fireEvent.change(screen.getByLabelText('Salon Name'), { target: { value: 'Test Salon' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Test Address' } });
    fireEvent.change(screen.getByLabelText('Contact Number'), { target: { value: '1234567890' } });

    fireEvent.click(screen.getByText('Add Salon'));

    await waitFor(() => {
      expect(addSalon).toHaveBeenCalledWith({
        name: 'Test Salon',
        address: 'Test Address',
        contactNumber: '1234567890',
        description: '',
      });
      expect(toast.success).toHaveBeenCalledWith('Salon added successfully');
    });
  });

  // Add more tests for updating and deleting salons
});
