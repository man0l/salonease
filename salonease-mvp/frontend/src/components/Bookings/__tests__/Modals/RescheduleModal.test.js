import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RescheduleModal from '../../Modals/RescheduleModal';
import { toast } from 'react-toastify';

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockBooking = {
  id: '1',
  staffId: 'staff1',
  appointmentDateTime: '2024-03-20T10:00:00Z',
};

describe('RescheduleModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when show is false', () => {
    render(
      <RescheduleModal
        show={false}
        onClose={() => {}}
        booking={mockBooking}
        onReschedule={() => {}}
        salonId="salon1"
      />
    );
    expect(screen.queryByText('Reschedule Booking')).not.toBeInTheDocument();
  });

  it('validates future dates only', async () => {
    const pastDate = new Date('2023-01-01T10:00:00Z');
    
    render(
      <RescheduleModal
        show={true}
        onClose={() => {}}
        booking={mockBooking}
        onReschedule={() => {}}
        salonId="salon1"
      />
    );

    const datePicker = screen.getByRole('textbox');
    
    await act(async () => {
      fireEvent.change(datePicker, {
        target: { value: pastDate.toLocaleString() },
      });
    });

    const confirmButton = screen.getByText('Confirm Reschedule');
    fireEvent.click(confirmButton);

    expect(toast.error).toHaveBeenCalledWith('Appointment date and time must be in the future');
  });

  it('calls onReschedule with correct parameters when form is valid', async () => {
    const mockOnReschedule = jest.fn();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    render(
      <RescheduleModal
        show={true}
        onClose={() => {}}
        booking={mockBooking}
        onReschedule={mockOnReschedule}
        salonId="salon1"
      />
    );

    const datePicker = screen.getByRole('textbox');
    
    await act(async () => {
      fireEvent.change(datePicker, {
        target: { value: futureDate.toLocaleString() },
      });
    });

    const confirmButton = screen.getByText('Confirm Reschedule');
    fireEvent.click(confirmButton);

    expect(mockOnReschedule).toHaveBeenCalledWith(
      mockBooking.id,
      expect.any(String)
    );
  });

  it('displays validation error when date is invalid', async () => {
    render(
      <RescheduleModal
        show={true}
        onClose={() => {}}
        booking={mockBooking}
        onReschedule={() => {}}
        salonId="salon1"
      />
    );

    const datePicker = screen.getByRole('textbox');
    
    await act(async () => {
      fireEvent.change(datePicker, {
        target: { value: 'invalid date' },
      });
    });

    const confirmButton = screen.getByText('Confirm Reschedule');
    fireEvent.click(confirmButton);

    expect(toast.error).toHaveBeenCalledWith('Appointment date and time must be in the future');
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    
    render(
      <RescheduleModal
        show={true}
        onClose={mockOnClose}
        booking={mockBooking}
        onReschedule={() => {}}
        salonId="salon1"
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});