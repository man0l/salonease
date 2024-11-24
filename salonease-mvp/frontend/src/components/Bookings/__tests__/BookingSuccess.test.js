import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BookingSuccess from '../BookingSuccess';

const mockBooking = {
  booking: {
    appointmentDateTime: '2024-03-20T10:00:00Z',
    staff: {
      fullName: 'John Doe'
    },
    service: {
      name: 'Haircut',
      price: 50
    }
  }
};

describe('BookingSuccess', () => {
  it('renders booking confirmation details', () => {
    render(<BookingSuccess booking={mockBooking} onClose={() => {}} />);

    expect(screen.getByTestId('booking-confirmed-title')).toBeInTheDocument();
    expect(screen.getByTestId('staff-member-name')).toHaveTextContent(mockBooking.booking.staff.fullName);
    expect(screen.getByTestId('service-name')).toHaveTextContent(mockBooking.booking.service.name);
  });

  it('formats date and time correctly', () => {
    render(<BookingSuccess booking={mockBooking} onClose={() => {}} />);

    const date = new Date(mockBooking.booking.appointmentDateTime);
    const formattedDate = date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });

    expect(screen.getByText(formattedDate)).toBeInTheDocument();
    expect(screen.getByText(formattedTime)).toBeInTheDocument();
  });

  it('handles missing booking data gracefully', () => {
    const incompleteBooking = {
      booking: {
        appointmentDateTime: null,
        staff: {},
        service: {}
      }
    };

    render(<BookingSuccess booking={incompleteBooking} onClose={() => {}} />);

    expect(screen.getByTestId('booking-confirmed-title')).toBeInTheDocument();
    expect(screen.getByTestId('appointment-scheduled-message')).toBeInTheDocument();
  });

  it('calls onClose when Done button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<BookingSuccess booking={mockBooking} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('Done'));
    expect(mockOnClose).toHaveBeenCalled();
  });
}); 