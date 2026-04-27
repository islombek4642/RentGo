import React from 'react';
import { render, waitFor, act, fireEvent } from '../../utils/test-utils';
import CarDetailScreen from '../../screens/Main/CarDetailScreen';
import api from '../../services/api';

// Mock toast
jest.mock('../../utils/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock config
jest.mock('../../constants/config', () => ({
  __esModule: true,
  default: { API_URL: 'http://localhost:3000/api/v1' },
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('CarDetailScreen', () => {
  const mockCar = {
    id: 'car-1',
    brand: 'Mercedes',
    model: 'AMG GT',
    year: 2024,
    price_per_day: '350',
    location: 'Tashkent',
    seats: 4,
    fuel_type: 'petrol',
    features: ['GPS Navigation', 'Leather Seats'],
    image_url: 'https://example.com/car.jpg',
    owner_name: 'Akbar Karimov',
    owner_verified: true,
    owner_rating: '4.8',
    owner_review_count: 12,
    description: 'Luxury sports car in excellent condition.',
  };

  const mockReviews = [
    {
      id: 'r1',
      reviewer_name: 'Ali',
      rating: 5,
      comment: 'Excellent car!',
      created_at: '2026-04-20T10:00:00Z',
    },
  ];

  const mockStats = { average: '4.8', count: 5 };

  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/reviews/car/'))
        return Promise.resolve({ data: { data: { reviews: mockReviews, stats: mockStats } } });
      if (url.includes('/cars/'))
        return Promise.resolve({ data: { data: { car: mockCar } } });
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders car info after loading', async () => {
    const route = { params: { carId: 'car-1' } };
    const { getByText } = render(
      <CarDetailScreen navigation={mockNavigation as any} route={route as any} />
    );

    await waitFor(() => {
      expect(getByText('Mercedes')).toBeTruthy();
      expect(getByText('AMG GT')).toBeTruthy();
      expect(getByText('2024')).toBeTruthy();
    });
  }, 15000);

  it('renders owner info with verified badge', async () => {
    const route = { params: { carId: 'car-1' } };
    const { getByText } = render(
      <CarDetailScreen navigation={mockNavigation as any} route={route as any} />
    );

    await waitFor(() => {
      expect(getByText('Akbar Karimov')).toBeTruthy();
      expect(getByText('profile.verified')).toBeTruthy();
    });
  }, 15000);

  it('shows unverified warning when owner is not verified', async () => {
    const unverifiedCar = { ...mockCar, owner_verified: false, owner_rating: '3.0' };
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/reviews/car/'))
        return Promise.resolve({ data: { data: { reviews: mockReviews, stats: mockStats } } });
      if (url.includes('/cars/'))
        return Promise.resolve({ data: { data: { car: unverifiedCar } } });
      return Promise.reject(new Error('Not found'));
    });

    const route = { params: { carId: 'car-1' } };
    const { getByText, queryByText } = render(
      <CarDetailScreen navigation={mockNavigation as any} route={route as any} />
    );

    await waitFor(() => {
      expect(getByText('Akbar Karimov')).toBeTruthy();
      expect(getByText('car.owner_not_verified')).toBeTruthy();
      expect(queryByText('profile.verified')).toBeNull();
    });
  }, 15000);

  it('renders rating and reviews', async () => {
    const route = { params: { carId: 'car-1' } };
    const { getByText } = render(
      <CarDetailScreen navigation={mockNavigation as any} route={route as any} />
    );

    await waitFor(() => {
      expect(getByText('Ali')).toBeTruthy();
      expect(getByText('Excellent car!')).toBeTruthy();
    });
  }, 15000);

  it('renders car features from data', async () => {
    const route = { params: { carId: 'car-1' } };
    const { getByText } = render(
      <CarDetailScreen navigation={mockNavigation as any} route={route as any} />
    );

    await waitFor(() => {
      expect(getByText('GPS Navigation')).toBeTruthy();
      expect(getByText('Leather Seats')).toBeTruthy();
    });
  }, 15000);

  it('shows no reviews text when reviews are empty', async () => {
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/reviews/car/'))
        return Promise.resolve({ data: { data: { reviews: [], stats: { average: 0, count: 0 } } } });
      if (url.includes('/cars/'))
        return Promise.resolve({ data: { data: { car: mockCar } } });
      return Promise.reject(new Error('Not found'));
    });

    const route = { params: { carId: 'car-1' } };
    const { getByText } = render(
      <CarDetailScreen navigation={mockNavigation as any} route={route as any} />
    );

    await waitFor(() => {
      expect(getByText('review.no_reviews')).toBeTruthy();
    });
  }, 15000);

  it('renders book now button in normal mode', async () => {
    const route = { params: { carId: 'car-1' } };
    const { getByText } = render(
      <CarDetailScreen navigation={mockNavigation as any} route={route as any} />
    );

    await waitFor(() => {
      expect(getByText('car.book_now')).toBeTruthy();
    });
  }, 15000);
});
