import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import StaffManagement from '../StaffManagement';
import { staffApi } from '../../../utils/api';
import { toast } from 'react-toastify';
import { useSalonContext } from '../../../contexts/SalonContext';

// Mock the entire SalonContext module
jest.mock('../../../contexts/SalonContext', () => ({
  useSalonContext: jest.fn(),
}));

jest.mock('../../../utils/api', () => ({
  staffApi: {
    getStaff: jest.fn(),
    inviteStaff: jest.fn(),
    updateStaff: jest.fn(),
    deleteStaff: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('StaffManagement', () => {
  beforeEach(() => {
    // Set up the mock implementation for useSalonContext
    useSalonContext.mockReturnValue({
      selectedSalon: { id: '1', name: 'Test Salon' }
    });

    staffApi.getStaff.mockResolvedValue({ data: [
      { id: '1', fullName: 'John Doe', email: 'john@example.com' },
      { id: '2', fullName: 'Jane Smith', email: 'jane@example.com' },
    ]});
  });

  it('renders staff list', async () => {
    await act(async () => {
      render(<StaffManagement />);
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('invites new staff', async () => {
    staffApi.inviteStaff.mockResolvedValue({});
    
    await act(async () => {
      render(<StaffManagement />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Add New Staff'));
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'new@example.com' } });
      fireEvent.change(screen.getByLabelText('Full Name:'), { target: { value: 'New Staff' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Invite Staff'));
    });

    await waitFor(() => {
      expect(staffApi.inviteStaff).toHaveBeenCalledWith('1', {
        email: 'new@example.com',
        fullName: 'New Staff',
      });
      expect(toast.success).toHaveBeenCalledWith('Staff invited successfully');
    });
  });

  it('updates staff', async () => {
    staffApi.updateStaff.mockResolvedValue({});
    
    await act(async () => {
      render(<StaffManagement />);
    });

    await act(async () => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Full Name:'), { target: { value: 'Updated Name' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Update Staff'));
    });

    await waitFor(() => {
      expect(staffApi.updateStaff).toHaveBeenCalledWith('1', '1', {
        email: 'john@example.com',
        fullName: 'Updated Name',
      });
      expect(toast.success).toHaveBeenCalledWith('Staff updated successfully');
    });
  });

  it('removes staff', async () => {
    staffApi.deleteStaff.mockResolvedValue({});
    window.confirm = jest.fn(() => true); // Mock the confirm dialog to always return true
    
    await act(async () => {
      render(<StaffManagement />);
    });

    await act(async () => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(staffApi.deleteStaff).toHaveBeenCalledWith('1', '1');
      expect(toast.success).toHaveBeenCalledWith('Staff deleted successfully');
    });
  });
});
