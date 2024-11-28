import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SalonManagement from '../SalonManagement';
import { SalonProvider } from '../../../contexts/SalonContext';
import { useSalon } from '../../../hooks/useSalon';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { subscriptionApi } from '../../../utils/api';

jest.mock('../../../hooks/useSalon');
jest.mock('../../../hooks/useAuth');
jest.mock('react-toastify');
jest.mock('../../../utils/api', () => ({
  subscriptionApi: {
    incrementBasePrice: jest.fn(),
  },
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderWithContext = (component) => {
  return render(
    <MemoryRouter>
      <SalonProvider>
        {component}
      </SalonProvider>
    </MemoryRouter>
  );
};

describe('SalonManagement', () => {
  const mockFetchSalons = jest.fn();
  const mockAddSalon = jest.fn();
  const mockUpdateSalon = jest.fn();
  const mockDeleteSalon = jest.fn();
  const mockUpdateUser = jest.fn();

  beforeEach(() => {
    useSalon.mockReturnValue({
      salons: [],
      loading: false,
      error: null,
      addSalon: mockAddSalon,
      updateSalon: mockUpdateSalon,
      deleteSalon: mockDeleteSalon,
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: jest.fn(),
      fetchSalons: mockFetchSalons,
    });

    useAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      updateUser: mockUpdateUser,
    });

    toast.success = jest.fn();
    toast.error = jest.fn();
  });

  it('renders the component without crashing', () => {
    renderWithContext(<SalonManagement />);
    expect(screen.getByText(/salon management/i)).toBeInTheDocument();
  });

  it('displays the add salon form when "Add New Salon" button is clicked', () => {
    renderWithContext(<SalonManagement />);
    fireEvent.click(screen.getByText(/add new salon/i));
    expect(screen.getByText(/add new salon/i)).toBeInTheDocument();
  });

  it('handles salon creation successfully', async () => {
    mockAddSalon.mockResolvedValueOnce({ id: '123', name: 'Test Salon' });
    subscriptionApi.incrementBasePrice.mockResolvedValueOnce({});

    renderWithContext(<SalonManagement />);
    fireEvent.click(screen.getByText(/add new salon/i));

    fireEvent.change(screen.getByLabelText(/salon name/i), { target: { value: 'Test Salon' } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: 'Test Address' } });
    fireEvent.change(screen.getByLabelText(/contact number/i), { target: { value: '1234567890' } });

    fireEvent.click(screen.getByText(/add salon/i));

    await waitFor(() => {
      expect(mockAddSalon).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Salon',
        address: 'Test Address',
        contactNumber: '1234567890',
      }));
      expect(toast.success).toHaveBeenCalledWith('Salon added successfully');
    });
  });

  // Add more tests as needed...
});
