import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import StaffManagement from '../StaffManagement';
import { SalonContext } from '../../../contexts/SalonContext';
import { staffApi } from '../../../utils/api';

jest.mock('../../../utils/api', () => ({
  staffApi: {
    getStaff: jest.fn(),
    inviteStaff: jest.fn(),
    updateStaff: jest.fn(),
    deleteStaff: jest.fn(),
  },
}));

const mockSalon = { id: '1', name: 'Test Salon' };

const renderWithContext = (component) => {
  return render(
    <SalonContext.Provider value={{ selectedSalon: mockSalon }}>
      {component}
    </SalonContext.Provider>
  );
};

describe('StaffManagement', () => {
  beforeEach(() => {
    staffApi.getStaff.mockResolvedValue({ data: [
      { id: '1', fullName: 'John Doe', role: 'stylist' },
      { id: '2', fullName: 'Jane Smith', role: 'manager' },
    ]});
  });

  it('renders staff list', async () => {
    renderWithContext(<StaffManagement />);
    await waitFor(() => {
      expect(screen.getByText('John Doe - stylist')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith - manager')).toBeInTheDocument();
    });
  });

  it('invites new staff', async () => {
    staffApi.inviteStaff.mockResolvedValue({});
    renderWithContext(<StaffManagement />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'New Staff' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'stylist' } });
    fireEvent.click(screen.getByText('Invite Staff'));

    await waitFor(() => {
      expect(staffApi.inviteStaff).toHaveBeenCalledWith('1', {
        email: 'new@example.com',
        fullName: 'New Staff',
        role: 'stylist',
      });
    });
  });

  it('promotes staff to manager', async () => {
    staffApi.updateStaff.mockResolvedValue({});
    renderWithContext(<StaffManagement />);

    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Promote to Manager')[0]);
    });

    expect(staffApi.updateStaff).toHaveBeenCalledWith('1', '1', { role: 'manager' });
  });

  it('removes staff', async () => {
    staffApi.deleteStaff.mockResolvedValue({});
    renderWithContext(<StaffManagement />);

    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Remove')[0]);
    });

    expect(staffApi.deleteStaff).toHaveBeenCalledWith('1', '1');
  });
});
