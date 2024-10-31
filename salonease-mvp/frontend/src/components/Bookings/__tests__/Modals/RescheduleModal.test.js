import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RescheduleModal from '../../Modals/RescheduleModal';
import { bookingApi } from '../../../../utils/api';
import { toast } from 'react-toastify';

jest.mock('../../../../utils/api', () => ({
  bookingApi: {
    checkAvailability: jest.fn(),
    exportClients: jest.fn(),
  },
}));

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
    bookingApi.checkAvailability.mockResolvedValue({
      data: ['2024-03-25T10:00:00Z', '2024-03-25T11:00:00Z'],
    });
    toast.error.mockClear();
  });

  it('checks availability on date change', async () => {
    await act(async () => {
      render(
        <RescheduleModal
          show={true}
          onClose={() => {}}
          booking={mockBooking}
          onReschedule={() => {}}
          salonId="salon1"
        />
      );
    });

    const datePicker = screen.getByDisplayValue('03/20/2024, 12:00 PM');
    
    await act(async () => {
      fireEvent.change(datePicker, {
        target: { value: '03/25/2024, 10:00 AM' },
      });
    });

    await waitFor(() => {
      expect(bookingApi.checkAvailability).toHaveBeenCalledWith(
        'salon1',
        'staff1',
        expect.any(Date)
      );
    });
  });

  it('handles availability check error', async () => {
    bookingApi.checkAvailability.mockRejectedValueOnce(new Error('Failed to check availability'));

    await act(async () => {
      render(
        <RescheduleModal
          show={true}
          onClose={() => {}}
          booking={mockBooking}
          onReschedule={() => {}}
          salonId="salon1"
        />
      );
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to check availability');
    });
  });
}); 