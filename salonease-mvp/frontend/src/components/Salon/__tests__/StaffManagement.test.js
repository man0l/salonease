import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import StaffManagement from '../StaffManagement';
import { staffApi } from '../../../utils/api';
import { toast } from 'react-toastify';
import { useSalonContext } from '../../../contexts/SalonContext';
import useStaff from '../../../hooks/useStaff';

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

jest.mock('../../../hooks/useStaff');

describe('StaffManagement', () => {
  beforeEach(() => {
    useSalonContext.mockReturnValue({
      selectedSalon: { id: '1', name: 'Test Salon' }
    });

    staffApi.getStaff.mockResolvedValue({ data: [
      { id: '1', fullName: 'John Doe', email: 'john@example.com' },
      { id: '2', fullName: 'Jane Smith', email: 'jane@example.com' },
    ]});

    useStaff.mockReturnValue({
      staff: [
        { id: '1', fullName: 'John Doe', email: 'john@example.com' },
        { id: '2', fullName: 'Jane Smith', email: 'jane@example.com' },
      ],
      loading: false,
      error: null,
      inviteStaff: jest.fn(),
      updateStaff: jest.fn(),
      deleteStaff: jest.fn(),
    });

    toast.success = jest.fn();
    toast.error = jest.fn();
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
    const { inviteStaff } = useStaff();
    
    render(<StaffManagement />);

    fireEvent.click(screen.getByText('Add New Staff'));

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'newstaff@example.com' } });
    fireEvent.change(screen.getByLabelText('Full Name:'), { target: { value: 'New Staff' } });

    fireEvent.click(screen.getByTestId('submit-button-invite-staff'));

    await waitFor(() => {
      expect(inviteStaff).toHaveBeenCalledWith({
        email: 'newstaff@example.com',
        fullName: 'New Staff',
      });
    });
  });

  it('updates staff', async () => {
    const { updateStaff } = useStaff();
    
    render(<StaffManagement />);

    const editButtons = screen.getAllByLabelText('Edit');
    fireEvent.click(editButtons[0]);

    fireEvent.change(screen.getByLabelText('Full Name:'), { target: { value: 'Updated Name' } });

    fireEvent.click(screen.getByText('Update Staff'));

    await waitFor(() => {
      expect(updateStaff).toHaveBeenCalledWith('1', {
        id: '1',
        email: 'john@example.com',
        fullName: 'Updated Name',
      });
    });
  });

  it('removes staff and associated user', async () => {
    const { deleteStaff } = useStaff();
    
    render(<StaffManagement />);

    const deleteButton = screen.getAllByLabelText('Delete')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });

    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(deleteStaff).toHaveBeenCalledWith('1');
    });
  });

  it('handles deletion error', async () => {
    const { deleteStaff } = useStaff();
    const errorMessage = 'You can only delete staff from your own salon';
    deleteStaff.mockRejectedValue(new Error(errorMessage));
    
    render(<StaffManagement />);

    const deleteButton = screen.getAllByLabelText('Delete')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });

    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(deleteStaff).toHaveBeenCalledWith('1');
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});
