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
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
    
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    
    expect(screen.getByTestId('cancel-confirmation-message')).toBeInTheDocument();
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
    const noteInput = screen.getByTestId('booking-note-input');
    fireEvent.change(noteInput, {
      target: { value: message },
    });

    const confirmButton = screen.getByTestId('confirm-cancel-button');
    fireEvent.click(confirmButton);
    
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

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });
}); 