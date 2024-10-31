import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BookingDetailsModal from '../../Modals/BookingDetailsModal';
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
  staffName: 'Jane Smith',
  appointmentDateTime: '2024-03-20T10:00:00Z',
  status: 'CONFIRMED',
  price: 50,
  notes: 'Test notes',
};

describe('BookingDetailsModal', () => {
  beforeEach(() => {
    toast.success.mockClear();
    toast.error.mockClear();
  });

  it('renders nothing when show is false', () => {
    render(<BookingDetailsModal show={false} onClose={() => {}} booking={mockBooking} />);
    expect(screen.queryByText('Booking Details')).not.toBeInTheDocument();
  });

  it('displays booking details when show is true', async () => {
    await act(async () => {
      render(<BookingDetailsModal show={true} onClose={() => {}} booking={mockBooking} />);
    });

    // Check for section headings
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getByText('Staff')).toBeInTheDocument();
    expect(screen.getByText('Date & Time')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();

    // Check for actual values
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    expect(screen.getByText('Test notes')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    
    await act(async () => {
      render(<BookingDetailsModal show={true} onClose={onClose} booking={mockBooking} />);
    });

    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
}); 