import React from 'react';
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
    useSalonContext.mockReturnValue({
      selectedSalon: { id: '1', name: 'Test Salon' }
    });

    staffApi.getStaff.mockResolvedValue({ data: [
      { id: '1', fullName: 'John Doe', email: 'john@example.com' },
      { id: '2', fullName: 'Jane Smith', email: 'jane@example.com' },
    ]});
  });

  it('renders staff list', async () => {
    render(<StaffManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('(john@example.com)')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('(jane@example.com)')).toBeInTheDocument();
    });
  });

  it('invites new staff', async () => {
    staffApi.inviteStaff.mockResolvedValue({});
    
    render(<StaffManagement />);

    // Click the "Add New Staff" button to show the form
    fireEvent.click(screen.getByText('Add New Staff'));

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'newstaff@example.com' } });
    fireEvent.change(screen.getByLabelText('Full Name:'), { target: { value: 'New Staff' } });

    // Submit the form
    fireEvent.click(screen.getByText('Invite Staff'));

    await waitFor(() => {
      expect(staffApi.inviteStaff).toHaveBeenCalledWith('1', {
        email: 'newstaff@example.com',
        fullName: 'New Staff',
      });
      expect(toast.success).toHaveBeenCalledWith('Staff invited successfully');
    });
  });

  it('updates staff', async () => {
    staffApi.updateStaff.mockResolvedValue({});
    
    render(<StaffManagement />);

    // Wait for the staff list to be rendered
    await waitFor(() => screen.getByText('John Doe'));

    // Click the edit button for the first staff member
    const editButtons = screen.getAllByLabelText('Edit');
    fireEvent.click(editButtons[0]);

    // Update the full name
    fireEvent.change(screen.getByLabelText('Full Name:'), { target: { value: 'Updated Name' } });

    // Submit the form
    fireEvent.click(screen.getByText('Update Staff'));

    await waitFor(() => {
      expect(staffApi.updateStaff).toHaveBeenCalledWith('1', '1', {
        email: 'john@example.com',
        fullName: 'Updated Name',
      });
      expect(toast.success).toHaveBeenCalledWith('Staff updated successfully');
    });
  });

  it('removes staff and associated user', async () => {
    staffApi.deleteStaff.mockResolvedValue({});
    
    render(<StaffManagement />);

    // Wait for the staff list to be rendered
    await waitFor(() => screen.getByText('John Doe'));

    // Find the delete button by its aria-label
    const deleteButton = screen.getAllByLabelText('Delete')[0];
    fireEvent.click(deleteButton);

    // Check if the confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });

    // Click the "Delete" button in the confirmation dialog
    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(staffApi.deleteStaff).toHaveBeenCalledWith('1', '1');
      expect(toast.success).toHaveBeenCalledWith('Staff and associated user deleted successfully');
    });

    // Check if the staff list is updated after deletion
    await waitFor(() => {
      expect(staffApi.getStaff).toHaveBeenCalledTimes(2); // Once on initial render, once after deletion
    });
  });

  it('handles deletion error', async () => {
    staffApi.deleteStaff.mockRejectedValue({ 
      response: { data: { message: 'You can only delete staff from your own salon' } }
    });
    
    render(<StaffManagement />);

    // Wait for the staff list to be rendered
    await waitFor(() => screen.getByText('John Doe'));

    // Find the delete button by its aria-label
    const deleteButton = screen.getAllByLabelText('Delete')[0];
    fireEvent.click(deleteButton);

    // Check if the confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });

    // Click the "Delete" button in the confirmation dialog
    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(staffApi.deleteStaff).toHaveBeenCalledWith('1', '1');
      expect(toast.error).toHaveBeenCalledWith('You can only delete staff from your own salon');
    });
  });
});
