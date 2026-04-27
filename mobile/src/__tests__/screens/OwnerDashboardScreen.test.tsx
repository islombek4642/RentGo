import React from 'react';
import { render, waitFor, fireEvent, act } from '../../utils/test-utils';
import OwnerDashboardScreen from '../../screens/Owner/OwnerDashboardScreen';
import api from '../../services/api';
import { toast } from '../../utils/toast';

// Mock toast
jest.mock('../../utils/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock useAuthStore
jest.mock('../../store/useAuthStore', () => ({
  useAuthStore: (selector: any) => {
    const state = {
      user: { name: 'Owner', role: 'owner', car_count: 3 },
    };
    return selector(state);
  },
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('OwnerDashboardScreen', () => {
  const mockBookings = [
    {
      id: 'ob1',
      brand: 'Chevrolet',
      model: 'Malibu',
      start_date: '2026-05-10',
      end_date: '2026-05-15',
      status: 'pending',
      total_price: '600',
      renter_name: 'Jasur Toshmatov',
      renter_phone: '+998901111111',
      created_at: new Date().toISOString(),
    },
    {
      id: 'ob2',
      brand: 'Kia',
      model: 'K5',
      start_date: '2026-04-01',
      end_date: '2026-04-05',
      status: 'completed',
      total_price: '500',
      renter_name: 'Bobur Aliyev',
      renter_phone: '+998902222222',
      created_at: '2026-04-01T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockResolvedValue({
      data: { data: { bookings: mockBookings } },
    });
  });

  it('renders dashboard with pending requests', async () => {
    const { getByText } = render(
      <OwnerDashboardScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('owner.dashboard')).toBeTruthy();
      expect(getByText('Chevrolet Malibu')).toBeTruthy();
      expect(getByText('Jasur Toshmatov')).toBeTruthy();
    });
  }, 15000);

  it('shows accept and reject buttons for pending bookings', async () => {
    const { getByText } = render(
      <OwnerDashboardScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('booking.accept')).toBeTruthy();
      expect(getByText('booking.reject')).toBeTruthy();
    });
  }, 15000);

  it('calls API to confirm a booking', async () => {
    (api.patch as jest.Mock).mockResolvedValue({ data: { status: 'success' } });

    const { getByText } = render(
      <OwnerDashboardScreen navigation={mockNavigation as any} />
    );

    const acceptBtn = await waitFor(() => getByText('booking.accept'));

    await act(async () => {
      fireEvent.press(acceptBtn);
    });

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/bookings/ob1/status', { status: 'confirmed' });
      expect(toast.success).toHaveBeenCalled();
    }, { timeout: 4000 });
  }, 15000);

  it('calls API to reject a booking', async () => {
    (api.patch as jest.Mock).mockResolvedValue({ data: { status: 'success' } });

    const { getByText } = render(
      <OwnerDashboardScreen navigation={mockNavigation as any} />
    );

    const rejectBtn = await waitFor(() => getByText('booking.reject'));

    await act(async () => {
      fireEvent.press(rejectBtn);
    });

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/bookings/ob1/status', { status: 'rejected' });
    }, { timeout: 4000 });
  }, 15000);

  it('shows renter contact info', async () => {
    const { getByText } = render(
      <OwnerDashboardScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('Jasur Toshmatov')).toBeTruthy();
      expect(getByText('+998901111111')).toBeTruthy();
    });
  }, 15000);

  it('renders stat cards with correct data', async () => {
    const { getByText } = render(
      <OwnerDashboardScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      // 1 pending booking
      expect(getByText('1')).toBeTruthy();
      expect(getByText('owner.stat_pending')).toBeTruthy();
    });
  }, 15000);
});
