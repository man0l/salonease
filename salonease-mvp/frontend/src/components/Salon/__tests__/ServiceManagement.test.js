import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ServiceManagement from '../ServiceManagement';
import useService from '../../../hooks/useService';
import { toast } from 'react-toastify';

// Mock the hooks and modules
jest.mock('../../../hooks/useService');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockServices = [
  { id: '1', name: 'Haircut', categoryId: 1, price: 30, duration: 30 },
  { id: '2', name: 'Coloring', categoryId: 2, price: 50, duration: 60 },
];

const mockCategories = [
  { 
    id: 1, 
    name: 'Hair',
    children: [
      { id: 3, name: 'Hair Services', parentId: 1 }
    ]
  },
  { 
    id: 2, 
    name: 'Color',
    children: []
  },
];

describe('ServiceManagement', () => {
  beforeEach(() => {
    useService.mockReturnValue({
      services: mockServices,
      categories: mockCategories,
      loading: false,
      error: null,
      addService: jest.fn(),
      updateService: jest.fn(),
      deleteService: jest.fn(),
    });
  });

  it('renders the component without crashing', () => {
    render(<ServiceManagement salonId="123" />);
    expect(screen.getByText('Service Management')).toBeInTheDocument();
  });

  it('displays the list of services', () => {
    render(<ServiceManagement salonId="123" />);
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('Coloring')).toBeInTheDocument();
  });

  it('opens the add service form when "Add New Service" is clicked', () => {
    render(<ServiceManagement salonId="123" />);
    fireEvent.click(screen.getByTestId('show-hide-form-button'));
    expect(screen.getByTestId('add-service-title')).toBeInTheDocument();
  });

  it('submits the form with valid data to add a new service', async () => {
    // Destructure the mock functions from useService
    const { addService } = useService();

    render(<ServiceManagement />);

    // Click the button to show the form
    fireEvent.click(screen.getByTestId('show-hide-form-button'));

    // Wait for the form to appear
    await waitFor(() => {
      expect(screen.getByTestId('add-service-title')).toBeInTheDocument();
    });

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText('Service Name:'), { target: { value: 'New Service' } });
    
    // Open the category dropdown
    fireEvent.click(screen.getByText('Select a category'));
    
    // First click the parent category to expand it
    await waitFor(() => {
      const parentCategory = screen.getByTestId('category-item-1');
      const expandButton = parentCategory.querySelector('button[aria-label="Expand category"]');
      fireEvent.click(expandButton);
    });

    // Then select the child category
    await waitFor(() => {
      const childCategory = screen.getByText('Hair Services');
      fireEvent.click(childCategory);
    });

    fireEvent.change(screen.getByLabelText('Price:'), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText('Duration (minutes):'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('Description:'), { target: { value: 'Test description' } });
    
    // Check if Promotional Offer field exists before interacting with it
    const promoOfferInput = screen.queryByLabelText('Promotional Offer:');
    if (promoOfferInput) {
      fireEvent.change(promoOfferInput, { target: { value: 'Test offer' } });
    }

    // Submit the form
    fireEvent.click(screen.getByTestId('add-service-button'));

    // Check if the addService function was called with the correct data
    await waitFor(() => {
      expect(addService).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Service',
        categoryId: 3,
        price: 40,
        duration: 45,
        description: 'Test description',
        ...(promoOfferInput && { promotionalOffer: 'Test offer' })
      }));
    });
  });

  it('opens the edit form when the edit button is clicked', () => {
    render(<ServiceManagement salonId="123" />);
    const editButtons = screen.getAllByLabelText('Edit');
    fireEvent.click(editButtons[0]);
    expect(screen.getByText('Edit Service')).toBeInTheDocument();
  });

  it('updates a service when the edit form is submitted', async () => {
    const { updateService } = useService();
    render(<ServiceManagement salonId="123" />);

    // Click edit button for the first service
    const editButtons = screen.getAllByLabelText('Edit');
    fireEvent.click(editButtons[0]);

    // Wait for the edit form to appear
    await waitFor(() => {
      expect(screen.getByText('Edit Service')).toBeInTheDocument();
    });

    // Fill in the form fields
    const nameInput = screen.getByLabelText('Service Name:');
    await act(async () => {
      fireEvent.change(nameInput, { 
        target: { value: 'Updated Haircut' } 
      });
    });

    // Submit the form
    const updateButton = screen.getByTestId('add-service-button');
    await act(async () => {
      fireEvent.click(updateButton);
    });

    // Verify the update service was called with correct parameters
    await waitFor(() => {
      expect(updateService).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'Updated Haircut'
      }));
    });
  });

  it('opens a confirmation dialog when delete button is clicked', () => {
    render(<ServiceManagement salonId="123" />);
    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
  });

  it('deletes a service when confirmed', async () => {
    const { deleteService } = useService();
    render(<ServiceManagement salonId="123" />);

    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);

    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(deleteService).toHaveBeenCalledWith('1');      
    });
  });

  it('displays an error message when service deletion fails', async () => {
    const { deleteService } = useService();
    deleteService.mockRejectedValue(new Error('Deletion failed'));

    render(<ServiceManagement salonId="123" />);

    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);

    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete service');
    });
  });

  it('displays loading state when fetching services', () => {
    useService.mockReturnValue({
      ...useService(),
      loading: true,
    });

    render(<ServiceManagement salonId="123" />);
    expect(screen.getByText('Loading services...')).toBeInTheDocument();
  });

  it('displays error message when service fetching fails', () => {
    useService.mockReturnValue({
      ...useService(),
      error: 'Failed to fetch services',
    });

    render(<ServiceManagement salonId="123" />);
    expect(screen.getByText('Failed to fetch services')).toBeInTheDocument();
  });
});
