import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import ClientsManagement from '../ClientsManagement';
import { ToastContainer } from 'react-toastify';
import { clientApi } from '../../../utils/api';

// Mock clientApi
jest.mock('../../../utils/api', () => ({
  clientApi: {
    getClients: jest.fn(),
    updateClient: jest.fn(),
    addClient: jest.fn(),
    exportClients: jest.fn(),
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ salonId: 'mockSalonId' }),
}));

const mockClients = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', notes: 'Regular customer', lastAppointmentDate: '2023-10-01' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', notes: 'VIP customer', lastAppointmentDate: '2023-09-15' },
];

describe('ClientsManagement', () => {
  beforeEach(() => {
    clientApi.getClients.mockResolvedValue({ data: mockClients });
  });

  test('renders ClientsManagement and displays clients', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsManagement />
          <ToastContainer />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('allows adding a new client', async () => {
    clientApi.addClient.mockResolvedValueOnce({ data: { id: '3', name: 'New Client', email: 'new@example.com', phone: '1112223333' } });

    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsManagement />
          <ToastContainer />
        </BrowserRouter>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add client/i }));
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'New Client' } });
      fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'new@example.com' } });
      fireEvent.change(screen.getByLabelText('Phone:'), { target: { value: '1112223333' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add client/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Client added successfully')).toBeInTheDocument();
    });

    expect(clientApi.addClient).toHaveBeenCalledWith('mockSalonId', {
      name: 'New Client',
      email: 'new@example.com',
      phone: '1112223333',
      notes: '',
    });
  });

  test('allows updating a client', async () => {
    clientApi.updateClient.mockResolvedValueOnce({ data: { ...mockClients[0], name: 'John Updated' } });

    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsManagement />
          <ToastContainer />
        </BrowserRouter>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Edit John Doe'));
    });

    await act(async () => {
      const nameInput = screen.getByLabelText('Name:');
      fireEvent.change(nameInput, { target: { value: 'John Updated' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update client/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Client updated successfully')).toBeInTheDocument();
    });

    expect(clientApi.updateClient).toHaveBeenCalledWith('mockSalonId', '1', expect.objectContaining({
      name: 'John Updated',
    }));
  });

  test('handles client update error', async () => {
    clientApi.updateClient.mockRejectedValueOnce(new Error('Update failed'));

    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsManagement />
          <ToastContainer />
        </BrowserRouter>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Edit John Doe'));
    });

    await act(async () => {
      const nameInput = screen.getByLabelText('Name:');
      fireEvent.change(nameInput, { target: { value: 'John Updated' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update client/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Error updating client')).toBeInTheDocument();
    });
  });

  test('exports clients as CSV', async () => {
    clientApi.exportClients.mockResolvedValueOnce({ data: new Blob(['name,email,phone\nJohn Doe,john@example.com,1234567890'], { type: 'text/csv' }) });

    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsManagement />
          <ToastContainer />
        </BrowserRouter>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /export clients/i }));
    });

    expect(clientApi.exportClients).toHaveBeenCalledWith('mockSalonId', ['name', 'email', 'phone']);
  });

  test('filters clients by search term', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsManagement />
          <ToastContainer />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Search clients'), { target: { value: 'Jane' } });
    });

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('exports only selected fields as CSV', async () => {
    clientApi.exportClients.mockResolvedValueOnce({
      data: new Blob(['name,email\nJohn Doe,john@example.com'], { type: 'text/csv' })
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsManagement />
          <ToastContainer />
        </BrowserRouter>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText('phone'));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /export clients/i }));
    });

    expect(clientApi.exportClients).toHaveBeenCalledWith('mockSalonId', ['name', 'email']);
  });

  test('toggles form visibility', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsManagement />
          <ToastContainer />
        </BrowserRouter>
      );
    });

    expect(screen.queryByText('Add New Client')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add client/i }));
    });

    expect(screen.getByText('Add New Client')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /hide form/i }));
    });

    expect(screen.queryByText('Add New Client')).not.toBeInTheDocument();
  });

  test('displays last appointment date', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsManagement />
          <ToastContainer />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Last Appointment: 10/1/2023')).toBeInTheDocument();
    expect(screen.getByText('Last Appointment: 9/15/2023')).toBeInTheDocument();
  });

  test('handles client add error', async () => {
    clientApi.addClient.mockRejectedValueOnce(new Error('Add failed'));

    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsManagement />
          <ToastContainer />
        </BrowserRouter>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add client/i }));
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'New Client' } });
      fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'new@example.com' } });
      fireEvent.change(screen.getByLabelText('Phone:'), { target: { value: '1112223333' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add client/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Error adding client')).toBeInTheDocument();
    });
  });

  test('handles export clients error', async () => {
    clientApi.exportClients.mockRejectedValueOnce(new Error('Export failed'));

    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsManagement />
          <ToastContainer />
        </BrowserRouter>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /export clients/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Error exporting clients')).toBeInTheDocument();
    });
  });
});
