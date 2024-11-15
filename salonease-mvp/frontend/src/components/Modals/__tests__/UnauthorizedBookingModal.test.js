import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UnauthorizedBookingModal from '../UnauthorizedBookingModal';
import { publicApi } from '../../../utils/api';
import { toast } from 'react-toastify';
import BookingSuccess from '../../Bookings/BookingSuccess';

// Mock dependencies
jest.mock('../../../utils/api', () => ({
  publicApi: {
    checkSalonAvailability: jest.fn(),
    createBooking: jest.fn()
  }
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Add BookingSuccess mock
jest.mock('../../Bookings/BookingSuccess', () => {
  return function MockBookingSuccess({ booking }) {
    return <div>Booking Confirmed!</div>;
  };
});

const mockService = {
  id: '1',
  name: 'Haircut',
  duration: 60,
  price: 50
};

const mockStaff = [
  { id: '1', fullName: 'John Doe' },
  { id: '2', fullName: 'Jane Smith' }
];

describe('UnauthorizedBookingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock available slots response
    publicApi.checkSalonAvailability.mockResolvedValue({
      data: { availableSlots: ['10:00', '10:30', '11:00'] }
    });
  });

  it('renders nothing when isOpen is false', () => {
    render(
      <UnauthorizedBookingModal
        isOpen={false}
        onClose={() => {}}
        salonId="1"
        service={mockService}
        staff={mockStaff}
      />
    );
    expect(screen.queryByText('Book Appointment')).not.toBeInTheDocument();
  });

  it('renders the modal with service details when isOpen is true', () => {
    render(
      <UnauthorizedBookingModal
        isOpen={true}
        onClose={() => {}}
        salonId="1"
        service={mockService}
        staff={mockStaff}
      />
    );

    expect(screen.getByText('Book Appointment')).toBeInTheDocument();
    expect(screen.getByText(mockService.name)).toBeInTheDocument();
    expect(screen.getByText(`Duration: ${mockService.duration} min`)).toBeInTheDocument();
    expect(screen.getByText(`Price: ${mockService.price}`)).toBeInTheDocument();
  });

  it('validates email format when provided', async () => {
    render(
      <UnauthorizedBookingModal
        isOpen={true}
        onClose={() => {}}
        salonId="1"
        service={mockService}
        staff={mockStaff}
      />
    );

    // Enter invalid email
    await act(async () => {
      const emailInput = screen.getByTestId('clientEmail');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      fireEvent.click(screen.getByTestId('submitButton'));
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });
});
