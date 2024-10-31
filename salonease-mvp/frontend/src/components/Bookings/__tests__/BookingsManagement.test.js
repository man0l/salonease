import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import BookingsManagement from '../BookingsManagement';
import { SalonProvider } from '../../../contexts/SalonContext';
import { bookingApi, serviceApi } from '../../../utils/api';
import { toast } from 'react-toastify';

// Mock all required modules
jest.mock('react-toastify');
jest.mock('../../../contexts/SalonContext', () => ({
  ...jest.requireActual('../../../contexts/SalonContext'),
  useSalonContext: jest.fn(),
}));

jest.mock('../../../utils/api', () => ({
  bookingApi: {
    getBookings: jest.fn(),
    updateBooking: jest.fn(),
    deleteBooking: jest.fn(),
    checkAvailability: jest.fn(),
  },
  serviceApi: {
    getCategories: jest.fn(),
    getServices: jest.fn(),
  }
}));

jest.mock('../../../hooks/useStaff', () => ({
  __esModule: true,
  default: () => ({ staff: [], loading: false })
}));

jest.mock('../../../hooks/useService', () => ({
  __esModule: true,
  default: () => ({ services: [], loading: false })
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ salonId: 'mockSalonId' }),
  useNavigate: () => jest.fn(),
}));

// Add useAuth mock
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'mockUserId' }
  })
}));

// Silence console.error during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

const mockBookings = [
  {
    id: '1',
    clientName: 'John Doe',
    serviceName: 'Haircut',
    appointmentDateTime: '2024-03-20T10:00:00Z',
    status: 'CONFIRMED',
  },
  {
    id: '2',
    clientName: 'Jane Smith',
    serviceName: 'Color',
    appointmentDateTime: '2024-03-21T14:00:00Z',
    status: 'CONFIRMED',
  },
];

describe('BookingsManagement', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the current date
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-25T10:00:00.000Z'));
    
    // Mock the SalonContext values
    require('../../../contexts/SalonContext').useSalonContext.mockReturnValue({
      selectedSalon: { id: 'mockSalonId', name: 'Test Salon' },
    });
    
    // Mock API responses
    bookingApi.getBookings.mockResolvedValue({ data: mockBookings });
    bookingApi.updateBooking.mockResolvedValue({ data: {} });
    bookingApi.deleteBooking.mockResolvedValue({ data: {} });
    bookingApi.checkAvailability.mockResolvedValue({ data: [] });
    serviceApi.getCategories.mockResolvedValue({ data: [] });
    serviceApi.getServices.mockResolvedValue({ data: [] });
    
    // Mock toast
    toast.success = jest.fn();
    toast.error = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderWithContext = async (component) => {
    let result;
    await act(async () => {
      result = render(
        <MemoryRouter>
          <SalonProvider>
            {component}
          </SalonProvider>
        </MemoryRouter>
      );
    });
    return result;
  };

  it('renders the component without crashing', async () => {
    await renderWithContext(<BookingsManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });
  });

  it('allows rescheduling a booking', async () => {
    const newDateString = '2024-03-25T10:00:00.000Z';
    const mockUpdatedBooking = { 
      ...mockBookings[0], 
      appointmentDateTime: newDateString
    };
    
    bookingApi.updateBooking.mockResolvedValue({ data: mockUpdatedBooking });
    bookingApi.checkAvailability.mockResolvedValue({ 
      data: [newDateString]
    });

    await renderWithContext(<BookingsManagement />);

    await act(async () => {
      fireEvent.click(screen.getAllByText('Reschedule')[0]);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('New Appointment Date'), {
        target: { value: newDateString }
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Reschedule'));
    });

    await waitFor(() => {
      expect(bookingApi.updateBooking).toHaveBeenCalledWith(
        'mockSalonId',
        '1',
        expect.objectContaining({
          appointmentDateTime: newDateString
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Booking rescheduled successfully');
    });
  });

  it('handles booking cancellation', async () => {
    await renderWithContext(<BookingsManagement />);

    await act(async () => {
      fireEvent.click(screen.getAllByText('Cancel')[0]);
    });

    const message = 'Cancellation message';
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Notification Message (optional)'), {
        target: { value: message },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Cancellation'));
    });

    await waitFor(() => {
      expect(bookingApi.deleteBooking).toHaveBeenCalledWith(
        'mockSalonId',
        '1',
        { notificationMessage: message }
      );
      expect(toast.success).toHaveBeenCalledWith('Booking cancelled successfully');
    });
  });

  it('handles booking cancellation error', async () => {
    bookingApi.deleteBooking.mockRejectedValue(new Error('Cancellation failed'));
    
    await renderWithContext(<BookingsManagement />);

    await act(async () => {
      fireEvent.click(screen.getAllByText('Cancel')[0]);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Cancellation'));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to cancel booking');
    });
  });

  it('displays loading state', async () => {
    bookingApi.getBookings.mockImplementation(() => new Promise(() => {}));
    
    await renderWithContext(<BookingsManagement />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
}); 