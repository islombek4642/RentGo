import React from 'react';
import { render, waitFor, fireEvent, act } from '../../utils/test-utils';
import MyBookingsScreen from '../../screens/Main/MyBookingsScreen';
import api from '../../services/api';
import { Alert } from 'react-native';

// Mock toast
jest.mock('../../utils/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNavigation = {
  navigate: jest.fn(),
};

describe('MyBookingsScreen', () => {
  const mockBookings = [
    {
      id: 'b1',
      brand: 'Toyota',
      model: 'Camry',
      start_date: '2026-05-01',
      end_date: '2026-05-05',
      status: 'pending',
      total_price: '800',
      car_id: 'c1',
      has_review: false,
    },
    {
      id: 'b2',
      brand: 'BMW',
      model: 'X5',
      start_date: '2026-04-10',
      end_date: '2026-04-15',
      status: 'completed',
      total_price: '1500',
      car_id: 'c2',
      has_review: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockResolvedValue({
      data: { data: { bookings: mockBookings } },
    });
  });

  it('renders bookings list with car names', async () => {
    const { getByText } = render(
      <MyBookingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('Toyota Camry')).toBeTruthy();
      expect(getByText('BMW X5')).toBeTruthy();
    });
  }, 15000);

  it('renders booking status badges', async () => {
    const { getByText } = render(
      <MyBookingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('STATUS.PENDING')).toBeTruthy();
      expect(getByText('STATUS.COMPLETED')).toBeTruthy();
    });
  }, 15000);

  it('shows cancel button for pending bookings', async () => {
    jest.spyOn(Alert, 'alert');

    const { getAllByText, getByText } = render(
      <MyBookingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => getByText('Toyota Camry'));

    // The Trash2 icon is rendered as text 'Trash2' by our mock
    // Find the cancel icon for the pending booking
    const trashIcons = getAllByText('Trash2');
    expect(trashIcons.length).toBeGreaterThanOrEqual(1);

    // Press the cancel action
    await act(async () => {
      fireEvent.press(trashIcons[0]);
    });

    // Alert should appear
    expect(Alert.alert).toHaveBeenCalledWith(
      'booking.cancel',
      'booking.cancel_confirm',
      expect.any(Array)
    );
  }, 15000);

  it('shows empty state when no bookings exist', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: { data: { bookings: [] } },
    });

    const { getByText } = render(
      <MyBookingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('profile.no_bookings')).toBeTruthy();
    });
  }, 15000);

  it('shows review badge for completed bookings with review', async () => {
    const { getByText } = render(
      <MyBookingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('review.success')).toBeTruthy();
    });
  }, 15000);

  it('navigates to booking detail on press', async () => {
    const { getAllByText, getByText } = render(
      <MyBookingsScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => getByText('Toyota Camry'));

    const detailButtons = getAllByText('common.details');
    await act(async () => {
      fireEvent.press(detailButtons[0]);
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('BookingDetail', { bookingId: 'b1' });
  }, 15000);
});
