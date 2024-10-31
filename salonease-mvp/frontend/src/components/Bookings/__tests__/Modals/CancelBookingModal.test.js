import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CancelBookingModal from '../../Modals/CancelBookingModal';
import { toast } from 'react-toastify';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockBooking = {
  id: '1',
  clientName: 'John Doe',
  serviceName: 'Haircut',
  appointmentDateTime: '2024-03-20T10:00:00Z',
};

describe('CancelBookingModal', () => {
  beforeEach(() => {
    toast.success.mockClear();
    toast.error.mockClear();
  });

  it('renders nothing when show is false', () => {
    render(
      <CancelBookingModal
        show={false}
        onClose={() => {}}
        booking={mockBooking}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByText('Cancel Booking')).not.toBeInTheDocument();
  });

  it('renders cancel confirmation when show is true', () => {
    render(
      <CancelBookingModal
        show={true}
        onClose={() => {}}
        booking={mockBooking}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Cancel Booking')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to cancel this booking/i)).toBeInTheDocument();
  });

  it('calls onCancel with notification message when confirmed', async () => {
    const onCancel = jest.fn();
    render(
      <CancelBookingModal
        show={true}
        onClose={() => {}}
        booking={mockBooking}
        onCancel={onCancel}
      />
    );

    const message = 'Cancellation due to emergency';
    fireEvent.change(screen.getByLabelText(/notification message/i), {
      target: { value: message },
    });

    fireEvent.click(screen.getByText('Confirm Cancellation'));
    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledWith(mockBooking.id, message);
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = jest.fn();
    render(
      <CancelBookingModal
        show={true}
        onClose={onClose}
        booking={mockBooking}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
}); 