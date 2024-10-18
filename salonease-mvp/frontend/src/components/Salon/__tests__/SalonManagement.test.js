import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SalonManagement from '../SalonManagement';
import { SalonProvider } from '../../../contexts/SalonContext';
import { useSalon } from '../../../hooks/useSalon';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';

jest.mock('../../../hooks/useSalon');
jest.mock('../../../hooks/useAuth');
jest.mock('react-toastify');
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
  beforeEach(() => {
    useSalon.mockReturnValue({
      salons: [],
      loading: false,
      error: null,
      addSalon: jest.fn(),
      updateSalon: jest.fn(),
      deleteSalon: jest.fn(),
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: jest.fn(),
      fetchSalons: jest.fn(),
    });

    useAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      updateUser: jest.fn(),
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

  it('submits the form with valid data', async () => {
    const mockAddSalon = jest.fn().mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Test Salon' });
    useSalon.mockReturnValue({
      ...useSalon(),
      addSalon: mockAddSalon,
    });

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
