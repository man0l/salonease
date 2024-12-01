import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { toast } from 'react-toastify';
import ClientsManagement from '../ClientsManagement';
import useClients from '../../../hooks/useClients';

// Mock dependencies
jest.mock('react-toastify');
jest.mock('../../../hooks/useClients');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ salonId: 'mockSalonId' }),
}));

// Mock the DeleteConfirmationDialog component
jest.mock('../../../components/common/DeleteConfirmationDialog', () => {
  return function MockDeleteConfirmationDialog({ isOpen, onConfirm }) {
    return isOpen ? (
      <div data-testid="delete-modal">
        <button onClick={onConfirm}>Delete</button>
      </div>
    ) : null;
  };
});

const mockClients = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    notes: 'Regular customer',
    lastAppointmentDate: '2024-03-20T10:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '098-765-4321',
    notes: 'Prefers afternoon appointments',
    lastAppointmentDate: '2024-03-15T14:00:00Z'
  }
];

describe('ClientsManagement', () => {
  let mockDeleteClient;
  let mockFetchClients;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create mock functions
    mockDeleteClient = jest.fn().mockResolvedValue(true);
    mockFetchClients = jest.fn();
    
    // Mock the useClients hook implementation
    useClients.mockImplementation(() => ({
      clients: mockClients,
      loading: false,
      error: null,
      fetchClients: mockFetchClients,
      addClient: jest.fn(),
      updateClient: jest.fn(),
      deleteClient: mockDeleteClient,
      exportClients: jest.fn()
    }));
  });

  const renderClientManagement = () => {
    return render(
      <Router>
        <ClientsManagement />
      </Router>
    );
  };

  it('renders client management component', async () => {
    renderClientManagement();
    
    expect(screen.getByText('Client Management')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search clients')).toBeInTheDocument();
    expect(screen.getByText('Export Clients')).toBeInTheDocument();
    expect(screen.getByText('Add Client')).toBeInTheDocument();
  });

  it('displays client list correctly', async () => {
    renderClientManagement();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('filters clients based on search term', async () => {
    renderClientManagement();

    const searchInput = screen.getByPlaceholderText('Search clients');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('toggles client form visibility', async () => {
    renderClientManagement();

    const addButton = screen.getByText('Add Client');
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Client')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hide Form'));
    
    await waitFor(() => {
      expect(screen.queryByText('Add New Client')).not.toBeInTheDocument();
    });
  });

  it('handles client update successfully', async () => {
    // Create mock functions
    const mockUpdateClient = jest.fn().mockResolvedValueOnce({});
    const mockFetchClients = jest.fn();
    
    // Update the useClients mock implementation specifically for this test
    useClients.mockImplementation(() => ({
      clients: mockClients,
      loading: false,
      error: null,
      fetchClients: mockFetchClients,
      addClient: jest.fn(),
      updateClient: mockUpdateClient,
      deleteClient: jest.fn(),
      exportClients: jest.fn()
    }));
    
    renderClientManagement();

    // Click edit button on first client
    const editButton = screen.getByLabelText('Edit John Doe');
    await act(async () => {
      fireEvent.click(editButton);
    });

    // Wait for the form to be visible
    await waitFor(() => {
      expect(screen.getByText('Edit Client')).toBeInTheDocument();
    });

    // Update the client's information
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name:/i), { 
        target: { value: 'Updated Name' } 
      });
      fireEvent.change(screen.getByLabelText(/phone:/i), { 
        target: { value: '999-999-9999' } 
      });
    });

    // Find and click the update button
    const updateButton = screen.getByText(/update client/i);
    await act(async () => {
      fireEvent.click(updateButton);
    });

    // Verify the update process
    await waitFor(() => {
      // Check that updateClient was called with the correct data
      expect(mockUpdateClient).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'Updated Name',
        email: 'john@example.com',
        phone: '999-999-9999',
        notes: 'Regular customer'
      }));
      expect(mockFetchClients).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Client updated successfully');
    });
  });

  it('handles client deletion', async () => {
    renderClientManagement();

    // Click delete button for the first client (John Doe)
    const deleteButton = screen.getByLabelText('Delete John Doe');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Wait for the delete confirmation modal to appear
    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });

    // Click the confirm delete button
    const confirmButton = screen.getByText('Delete');
    await act(async () => {
      fireEvent.click(confirmButton);
      // Wait for the promise from mockDeleteClient to resolve
      await mockDeleteClient();
    });

    // Wait for and verify the deletion process
    await waitFor(() => {
      expect(mockDeleteClient).toHaveBeenCalledWith('mockSalonId', '1');
      expect(mockFetchClients).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/client.*deleted.*successfully/i));
    });
  });

  it('handles export clients functionality', async () => {
    // Create a mock function for exportClients
    const mockExportClients = jest.fn().mockResolvedValueOnce({});
    
    // Update the useClients mock implementation specifically for this test
    useClients.mockImplementation(() => ({
      clients: mockClients,
      loading: false,
      error: null,
      fetchClients: jest.fn(),
      addClient: jest.fn(),
      updateClient: jest.fn(),
      deleteClient: jest.fn(),
      exportClients: mockExportClients
    }));
    
    renderClientManagement();

    // Find and click the export button
    const exportButton = screen.getByRole('button', {
      name: /export clients/i,
    });
    
    await act(async () => {
      fireEvent.click(exportButton);
    });

    // Wait for the export function to be called
    await waitFor(() => {
      expect(mockExportClients).toHaveBeenCalled();
    });
  });

  it('displays loading state', async () => {
    useClients.mockImplementation(() => ({
      clients: [],
      loading: true,
      error: null,
      fetchClients: jest.fn()
    }));

    renderClientManagement();
    
    expect(screen.getByText('No clients found.')).toBeInTheDocument();
  });

  it('handles error states in form submission', async () => {
    const { addClient } = useClients();
    addClient.mockRejectedValueOnce(new Error('Failed to add client'));
    
    renderClientManagement();

    // Open the form
    fireEvent.click(screen.getByText('Add Client'));

    // Submit the form without required fields
    await act(async () => {
      fireEvent.click(screen.getByText('Add Client'));
    });

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Phone is required')).toBeInTheDocument();
    });
  });

  it('handles client addition successfully', async () => {
    // Create mock functions
    const mockAddClient = jest.fn().mockResolvedValueOnce({});
    const mockFetchClients = jest.fn();
    
    // Update the useClients mock implementation specifically for this test
    useClients.mockImplementation(() => ({
      clients: mockClients,
      loading: false,
      error: null,
      fetchClients: mockFetchClients,
      addClient: mockAddClient,
      updateClient: jest.fn(),
      deleteClient: jest.fn(),
      exportClients: jest.fn()
    }));
    
    renderClientManagement();

    // Click add client button
    fireEvent.click(screen.getByText('Add Client'));

    // Wait for the form to be visible
    await waitFor(() => {
      expect(screen.getByText('Add New Client')).toBeInTheDocument();
    });

    // Fill in the form fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name:/i), { 
        target: { value: 'New Client' } 
      });
      fireEvent.change(screen.getByLabelText(/email:/i), { 
        target: { value: 'newclient@example.com' } 
      });
      fireEvent.change(screen.getByLabelText(/phone:/i), { 
        target: { value: '123-456-7890' } 
      });
      fireEvent.change(screen.getByLabelText(/notes:/i), { 
        target: { value: 'Test notes' } 
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText(/add client/i));
    });

    // Verify the addition process
    await waitFor(() => {
      // Check that addClient was called with the correct data
      expect(mockAddClient).toHaveBeenCalledWith({
        name: 'New Client',
        email: 'newclient@example.com',
        phone: '123-456-7890',
        notes: 'Test notes'
      });
      // Verify that fetchClients was called to refresh the list
      expect(mockFetchClients).toHaveBeenCalled();
    });
  });
}); 