import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ServiceManagement from '../ServiceManagement';
import { serviceApi } from '../../../utils/api';
import { toast } from 'react-toastify';
import { useSalonContext } from '../../../contexts/SalonContext';

jest.mock('../../../contexts/SalonContext', () => ({
  useSalonContext: jest.fn(),
}));

jest.mock('../../../utils/api', () => ({
  serviceApi: {
    getServices: jest.fn(),
    createService: jest.fn(),
    updateService: jest.fn(),
    deleteService: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../utils/currencyFormatter', () => ({
  formatCurrency: jest.fn(amount => `$${amount.toFixed(2)}`),
}));

describe('ServiceManagement', () => {
  beforeEach(() => {
    useSalonContext.mockReturnValue({
      selectedSalon: { id: '1', name: 'Test Salon' }
    });

    serviceApi.getServices.mockResolvedValue({ data: [
      { id: '1', name: 'Haircut', category: 'Hair', price: 50, duration: 30 },
      { id: '2', name: 'Manicure', category: 'Nails', price: 30, duration: 45 },
    ]});
  });

  it('renders service list', async () => {
    render(<ServiceManagement />);

    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
      expect(screen.getByText('(Hair)')).toBeInTheDocument();
      expect(screen.getByText('Manicure')).toBeInTheDocument();
      expect(screen.getByText('(Nails)')).toBeInTheDocument();
    });
  });

  it('adds new service', async () => {
    serviceApi.createService.mockResolvedValue({});
    
    render(<ServiceManagement />);

    fireEvent.click(screen.getByText('Add New Service'));

    fireEvent.change(screen.getByLabelText('Service Name:'), { target: { value: 'New Service' } });
    fireEvent.change(screen.getByLabelText('Category:'), { target: { value: 'New Category' } });
    fireEvent.change(screen.getByLabelText('Price:'), { target: { value: '75' } });
    fireEvent.change(screen.getByLabelText('Duration (minutes):'), { target: { value: '60' } });

    fireEvent.click(screen.getByText('Add Service'));

    await waitFor(() => {
      expect(serviceApi.createService).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'New Service',
        category: 'New Category',
        price: 75,
        duration: 60,
      }));
      expect(toast.success).toHaveBeenCalledWith('Service added successfully');
    });
  });

  it('updates service', async () => {
    serviceApi.updateService.mockResolvedValue({});
    
    render(<ServiceManagement />);

    await waitFor(() => screen.getByText('Haircut'));

    const editButtons = screen.getAllByLabelText('Edit');
    fireEvent.click(editButtons[0]);

    fireEvent.change(screen.getByLabelText('Service Name:'), { target: { value: 'Updated Haircut' } });

    fireEvent.click(screen.getByText('Update Service'));

    await waitFor(() => {
      expect(serviceApi.updateService).toHaveBeenCalledWith('1', '1', expect.objectContaining({
        name: 'Updated Haircut',
      }));
      expect(toast.success).toHaveBeenCalledWith('Service updated successfully');
    });
  });

  it('deletes service', async () => {
    serviceApi.deleteService.mockResolvedValue({});
    
    render(<ServiceManagement />);

    await waitFor(() => screen.getByText('Haircut'));

    const deleteButton = screen.getAllByLabelText('Delete')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });

    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(serviceApi.deleteService).toHaveBeenCalledWith('1', '1');
      expect(toast.success).toHaveBeenCalledWith('Service deleted successfully');
    });

    await waitFor(() => {
      expect(serviceApi.getServices).toHaveBeenCalledTimes(2);
    });
  });
});
