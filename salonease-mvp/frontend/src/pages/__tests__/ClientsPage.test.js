import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import ClientsPage from '../ClientsPage';
import { ToastContainer } from 'react-toastify';
import { clientApi } from '../../utils/api'; // Import the clientApi

// Mock clientApi
jest.mock('../../utils/api', () => ({
  clientApi: {
    getClients: jest.fn(),
    updateClient: jest.fn(),
    exportClients: jest.fn(),
  },
}));

// Add this mock at the top of your test file
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ salonId: 'mockSalonId' }), // Mock the useParams hook
}));

const mockClients = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', notes: 'Regular customer', lastAppointmentDate: '2023-10-01' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', notes: 'VIP customer', lastAppointmentDate: '2023-09-15' },
];

describe('ClientsPage', () => {
  beforeEach(() => {
    clientApi.getClients.mockResolvedValue({ data: mockClients });
  });

  test('renders ClientsPage and displays clients', async () => {
    render(
      <BrowserRouter>
        <ClientsPage />
        <ToastContainer />
      </BrowserRouter>
    );

    // Wait for clients to be displayed
    await waitFor(() => {
        expect(screen.getByText((content, element) => {
            return element.tagName.toLowerCase() === 'li' && 
                     content.includes('John Doe') && 
                     content.includes('john@example.com');
            })).toBeInTheDocument();
    });
  });

  test('allows updating a client', async () => {
    render(
      <BrowserRouter>
        <ClientsPage />
        <ToastContainer />
      </BrowserRouter>
    );

    // Wait for clients to be displayed
    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'li' && 
               content.includes('John Doe') && 
               content.includes('john@example.com');
      })).toBeInTheDocument();
    });

    // Click on the client to open the edit form
    fireEvent.click(screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'li' && 
             content.includes('John Doe') && 
             content.includes('john@example.com');
    }));

    // Find the edit form inputs and update button
    const nameInput = await screen.findByDisplayValue('John Doe');
    const updateButton = await screen.findByText('Update Client');

    // Change the client's name
    fireEvent.change(nameInput, { target: { value: 'John Updated' } });

    // Click the update button
    fireEvent.click(updateButton);

    // Check if the success toast is displayed
    await waitFor(() => {
      expect(screen.getByText('Client updated successfully')).toBeInTheDocument();
    }, { timeout: 3000 });

  });

  test('handles client update error', async () => {
    render(
      <BrowserRouter>
        <ClientsPage />
        <ToastContainer />
      </BrowserRouter>
    );

    // Mock the updateClient API call to simulate an error
    clientApi.updateClient.mockRejectedValueOnce(new Error('Update failed'));

    // Wait for clients to be displayed
    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'li' && 
               content.includes('John Doe') && 
               content.includes('john@example.com');
      })).toBeInTheDocument();
    });

    // Click on the client to open the edit form
    fireEvent.click(screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'li' && 
             content.includes('John Doe') && 
             content.includes('john@example.com');
    }));

    // Find the edit form inputs and update button
    const nameInput = screen.getByDisplayValue('John Doe');
    const emailInput = screen.getByDisplayValue('john@example.com');
    const updateButton = screen.getByText('Update Client');

    // Change the client's name
    fireEvent.change(nameInput, { target: { value: 'John Updated' } });

    // Click the update button
    fireEvent.click(updateButton);

    // Check if the error toast is displayed
    await waitFor(() => {
      expect(screen.getByText('Error updating client')).toBeInTheDocument();
    });

    // Verify that the client's name hasn't changed in the list
    expect(screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'li' && 
             content.includes('John Doe') && 
             content.includes('john@example.com');
    })).toBeInTheDocument();
  });

  test('exports clients as CSV', async () => {
    render(
      <BrowserRouter>
        <ClientsPage />
        <ToastContainer />
      </BrowserRouter>
    );

    // Mock the exportClients request
    clientApi.exportClients.mockResolvedValueOnce({ data: new Blob(['name,email,phone\nJohn Doe,john@example.com,1234567890'], { type: 'text/csv' }) });

    // Click on the export button
    fireEvent.click(screen.getByText('Export Clients'));

    // Check if the export request was made
    await waitFor(() => {
      expect(clientApi.exportClients).toHaveBeenCalledWith('mockSalonId', ['name', 'email', 'phone']);
    });
  });

  test('filters clients by search term', async () => {
    render(
      <BrowserRouter>
        <ClientsPage />
        <ToastContainer />
      </BrowserRouter>
    );

    // Wait for clients to be displayed
    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'li' && 
               content.includes('John Doe') && 
               content.includes('john@example.com');
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'li' && 
               content.includes('Jane Smith') && 
               content.includes('jane@example.com');
      })).toBeInTheDocument();
    });

    // Enter search term
    fireEvent.change(screen.getByPlaceholderText('Search clients'), { target: { value: 'Jane' } });

    // Check if only Jane Smith is displayed
    await waitFor(() => {
      expect(screen.queryByText((content, element) => {
        return element.tagName.toLowerCase() === 'li' && 
               content.includes('John Doe') && 
               content.includes('john@example.com');
      })).not.toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'li' && 
               content.includes('Jane Smith') && 
               content.includes('jane@example.com');
      })).toBeInTheDocument();
    });
  });

  test('exports only selected fields as CSV', async () => {
    render(
      <BrowserRouter>
        <ClientsPage />
        <ToastContainer />
      </BrowserRouter>
    );

    // Mock the exportClients request
    clientApi.exportClients.mockResolvedValueOnce({
      data: new Blob(['name,email\nJohn Doe,john@example.com'], { type: 'text/csv' })
    });

    // Uncheck the 'Phone' field
    fireEvent.click(screen.getByLabelText('Phone'));

    // Click on the export button
    fireEvent.click(screen.getByText('Export Clients'));

    // Check if the export request was made with only name and email fields
    await waitFor(() => {
      expect(clientApi.exportClients).toHaveBeenCalledWith('mockSalonId', ['name', 'email']);
    });
  });
});
