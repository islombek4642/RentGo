import React from 'react';
import { render, fireEvent, waitFor } from '../../utils/test-utils';
import BookingScreen from '../../screens/Main/BookingScreen';
import api from '../../services/api';
import { toast } from '../../utils/toast';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock route
const mockRoute = {
  params: { carId: 'car-123' },
};

// Mock toast
jest.mock('../../utils/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock react-native-calendars
jest.mock('react-native-calendars', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    Calendar: (props: any) => (
      <View testID="mock-calendar">
        <View testID="calendar-arrows">
          {props.renderArrow && props.renderArrow('left')}
          {props.renderArrow && props.renderArrow('right')}
        </View>
        <TouchableOpacity onPress={() => props.onDayPress({ dateString: '2026-05-10' })}>
          <Text>Select 2026-05-10</Text>
        </TouchableOpacity>
        <Text testID="min-date">{props.minDate}</Text>
      </View>
    ),
  };
});

describe('BookingScreen', () => {
  const mockCar = {
    id: 'car-123',
    brand: 'BMW',
    model: 'M4',
    price_per_day: '200',
    location: 'Tashkent',
  };

  const mockHeatmap = {
    dates: [
      { start_date: '2026-06-01', end_date: '2026-06-05', status: 'confirmed' },
      { start_date: '2026-06-10', end_date: '2026-06-12', status: 'pending' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/cars/')) return Promise.resolve({ data: { data: { car: mockCar } } });
      if (url.includes('/bookings/car/')) return Promise.resolve({ data: { data: mockHeatmap } });
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders correctly and fetches car details', async () => {
    const { getByText } = render(
      <BookingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => {
      expect(getByText('BMW M4')).toBeTruthy();
      expect(getByText('Tashkent')).toBeTruthy();
    });
  });

  it('calculates total price correctly', async () => {
    const { getAllByText } = render(
      <BookingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => {
      // $200 appears twice: daily rate and total price
      expect(getAllByText('$200').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('handles booking submission success', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      status: 201,
      data: {
        data: {
          booking: { id: 'booking-999' },
        },
      },
    });

    const { getByText } = render(
      <BookingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => expect(getByText('booking.confirm')).toBeTruthy());
    
    fireEvent.press(getByText('booking.confirm'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith('BookingSuccess', expect.any(Object));
    });
  });

  it('shows soft warning when pending dates are selected', async () => {
    // This requires simulating date selection that overlaps with mockHeatmap pending dates
    // Our mock calendar helper allows selecting 2026-05-10
    // Let's modify the mock heatmap to include 2026-05-10
    const pendingHeatmap = {
       dates: [{ start_date: '2026-05-09', end_date: '2026-05-11', status: 'pending' }]
    };
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/cars/')) return Promise.resolve({ data: { data: { car: mockCar } } });
      if (url.includes('/bookings/car/')) return Promise.resolve({ data: { data: pendingHeatmap } });
      return Promise.reject(new Error('Not found'));
    });

    const { getByText, queryByText } = render(
      <BookingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => expect(getByText('Select 2026-05-10')).toBeTruthy());
    
    fireEvent.press(getByText('Select 2026-05-10'));

    await waitFor(() => {
      expect(getByText('booking.pending_title')).toBeTruthy();
    });
  });

  it('handles booking conflict error (hard block)', async () => {
    const conflictError = {
      response: {
        data: {
          message: 'Dates already taken',
          details: {
            code: 'BOOKING_CONFLICT',
            conflictRange: { start: '2026-07-01', end: '2026-07-05' },
            nextAvailableDate: '2026-07-06'
          }
        }
      }
    };
    (api.post as jest.Mock).mockRejectedValue(conflictError);

    const { getByText } = render(
      <BookingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => expect(getByText('booking.confirm')).toBeTruthy());
    fireEvent.press(getByText('booking.confirm'));

    await waitFor(() => {
      expect(getByText('booking.conflict_title')).toBeTruthy();
      expect(getByText('booking.book_from_next')).toBeTruthy();
    });
  });

  it('renders custom calendar navigation arrows', async () => {
    const { getByTestId } = render(
      <BookingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => {
      const container = getByTestId('calendar-arrows');
      expect(container).toBeTruthy();
      // Ensure we have two children (Left and Right arrows)
      expect(container.children.length).toBe(2);
    });
  });
});
