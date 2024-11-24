import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RescheduleModal from '../../Modals/RescheduleModal';
import { toast } from 'react-toastify';
import { publicApi } from '../../../../utils/api';

// Add mocks
jest.mock('../../../../utils/api', () => ({
  publicApi: {
    checkSalonAvailability: jest.fn()
  }
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Add mock for i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'common:action.close': 'Close',
        'common:action.confirm_reschedule': 'Confirm Reschedule',
        'bookings:validation.appointment_date_time.future': 'Appointment date and time must be in the future',
        'bookings:modal.reschedule.title': 'Reschedule Booking'
      };
      return translations[key] || key;
    }
  })
}));

const mockBooking = {
  id: '1',
  staffId: 'staff1',
  appointmentDateTime: '2024-03-20T10:00:00Z',
};

describe('RescheduleModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response
    publicApi.checkSalonAvailability.mockResolvedValue({
      data: { availableSlots: ['10:00', '11:00', '12:00'] }
    });
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

    const datePicker = screen.getByDisplayValue('March 20, 2024');
    
    await act(async () => {
      fireEvent.change(datePicker, {
        target: { value: pastDate.toLocaleString() },
      });
      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Reschedule'));
      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(toast.error).toHaveBeenCalledWith('Appointment date and time must be in the future');
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

    const datePicker = screen.getByDisplayValue('March 20, 2024');
    
    await act(async () => {
      fireEvent.click(datePicker);
      fireEvent.change(datePicker, {
        target: { value: 'not a date' }
      });
      // Simulate blur to trigger validation
      fireEvent.blur(datePicker);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Reschedule'));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(toast.error).toHaveBeenCalledWith('Appointment date and time must be in the future');
  });

  it('calls onClose when close button is clicked', async () => {
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

    await act(async () => {
      fireEvent.click(screen.getByText('Close'));
      // Wait for any state updates
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
});