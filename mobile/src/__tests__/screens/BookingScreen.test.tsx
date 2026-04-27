import React from 'react';
import { render, fireEvent, waitFor, act } from '../../utils/test-utils';
import BookingScreen from '../../screens/Main/BookingScreen';
import api from '../../services/api';

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
        <TouchableOpacity onPress={() => props.onDayPress({ dateString: '2026-05-10' })}>
          <Text>Select 2026-05-10</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => props.onDayPress({ dateString: '2026-05-15' })}>
          <Text>Select 2026-05-15</Text>
        </TouchableOpacity>
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
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
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

  it('calculates total price correctly when dates are selected', async () => {
    const { getByText, findAllByText } = render(
      <BookingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => getByText('BMW M4'));

    // Sequence to ensure fresh selection:
    // 1. Click 05-10 (sets as end date if today is start)
    await act(async () => {
      fireEvent.press(getByText('Select 2026-05-10'));
    });
    // 2. Click 05-10 again (resets and sets as start date)
    await act(async () => {
      fireEvent.press(getByText('Select 2026-05-10'));
    });
    // 3. Click 05-15 (sets as end date)
    await act(async () => {
      fireEvent.press(getByText('Select 2026-05-15'));
    });

    // 5 days * 200 = 1000
    await waitFor(async () => {
      const priceElements = await findAllByText(/1[,\s]000/);
      expect(priceElements.length).toBeGreaterThanOrEqual(1);
    }, { timeout: 10000 });
  }, 20000);

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

    await waitFor(() => getByText('BMW M4'));

    await act(async () => {
      fireEvent.press(getByText('Select 2026-05-10'));
    });
    await act(async () => {
      fireEvent.press(getByText('Select 2026-05-10'));
    });
    await act(async () => {
      fireEvent.press(getByText('Select 2026-05-15'));
    });

    const confirmBtn = getByText('booking.confirm');
    
    await act(async () => {
      fireEvent.press(confirmBtn);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith('BookingSuccess', expect.any(Object));
    });
  }, 20000);

  it('shows soft warning when pending dates are selected', async () => {
    const pendingHeatmap = {
       dates: [{ start_date: '2026-05-11', end_date: '2026-05-14', status: 'pending' }]
    };
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/cars/')) return Promise.resolve({ data: { data: { car: mockCar } } });
      if (url.includes('/bookings/car/')) return Promise.resolve({ data: { data: pendingHeatmap } });
      return Promise.reject(new Error('Not found'));
    });

    const { getByText } = render(
      <BookingScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => getByText('BMW M4'));

    await act(async () => {
      fireEvent.press(getByText('Select 2026-05-10'));
    });
    await act(async () => {
      fireEvent.press(getByText('Select 2026-05-10'));
    });
    await act(async () => {
      fireEvent.press(getByText('Select 2026-05-15'));
    });

    await waitFor(() => {
      expect(getByText('booking.pending_title')).toBeTruthy();
    });
  }, 20000);
});
