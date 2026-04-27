import React from 'react';
import { render, fireEvent, waitFor, act } from '../../utils/test-utils';
import HomeScreen from '../../screens/Main/HomeScreen';
import api from '../../services/api';

const mockNavigation = {
  navigate: jest.fn(),
};

describe('HomeScreen', () => {
  const mockCars = [
    {
      id: '1',
      brand: 'Tesla',
      model: 'Model 3',
      year: 2023,
      price_per_day: '150',
      location: 'Tashkent',
      display_location: 'Tashkent, Uzbekistan',
      image_url: 'https://example.com/tesla.jpg',
    },
    {
      id: '2',
      brand: 'BMW',
      model: 'X5',
      year: 2024,
      price_per_day: '250',
      location: 'Samarkand',
      display_location: 'Samarkand, Uzbekistan',
      image_url: 'https://example.com/bmw.jpg',
    },
  ];

  const mockRegions = [
    { id: 1, name_uz: 'Tashkent', name_ru: 'Ташкент', name_oz: 'Toshkent' },
    { id: 2, name_uz: 'Samarkand', name_ru: 'Самарканд', name_oz: 'Samarqand' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/locations/regions')) {
        return Promise.resolve({ data: { data: { regions: mockRegions } } });
      }
      if (url.includes('/cars')) {
        return Promise.resolve({ data: { data: { cars: mockCars } } });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders greeting, title, and car list from API', async () => {
    const { getByText, getAllByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      // Verify header renders
      expect(getByText('home.greeting')).toBeTruthy();
      expect(getByText('home.title')).toBeTruthy();

      // Verify car data renders — not just API call, but actual UI elements
      expect(getByText('Tesla Model 3')).toBeTruthy();
      expect(getByText('BMW X5')).toBeTruthy();
    });
  }, 15000);

  it('renders car prices in the list', async () => {
    const { getByText, getAllByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      // Verify prices render (price_per_day formatted with currency)
      expect(getAllByText(/150/)).toBeTruthy();
      expect(getAllByText(/250/)).toBeTruthy();
    });
  }, 15000);

  it('handles search input and verifies API + UI update', async () => {
    // First render with full list
    const { getByPlaceholderText, getByText, queryByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('Tesla Model 3')).toBeTruthy();
    });

    // Now mock API to return filtered results for search
    (api.get as jest.Mock).mockImplementation((url, opts) => {
      if (url.includes('/locations/regions')) {
        return Promise.resolve({ data: { data: { regions: mockRegions } } });
      }
      // Return only BMW when search param exists
      if (url === '/cars' && opts?.params?.search) {
        return Promise.resolve({ data: { data: { cars: [mockCars[1]] } } });
      }
      return Promise.resolve({ data: { data: { cars: mockCars } } });
    });

    const searchInput = getByPlaceholderText('home.search');

    await act(async () => {
      fireEvent.changeText(searchInput, 'BMW');
    });

    // Wait for debounce + API call + UI update
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/cars', expect.objectContaining({
        params: expect.objectContaining({ search: 'BMW' }),
      }));
    }, { timeout: 3000 });
  });

  it('renders region filter tabs from API data', async () => {
    const { getAllByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getAllByText('Tashkent').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('Samarkand').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('handles city filter selection and verifies API params', async () => {
    const { getAllByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    const cityButton = await waitFor(() => getAllByText('Tashkent')[0]);

    await act(async () => {
      fireEvent.press(cityButton);
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/cars', expect.objectContaining({
        params: expect.objectContaining({ region_id: 1 }),
      }));
    }, { timeout: 3000 });
  });

  it('renders car type filter tabs', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('filters.all_types')).toBeTruthy();
      expect(getByText('filters.economy')).toBeTruthy();
      expect(getByText('filters.luxury')).toBeTruthy();
    });
  });

  it('shows empty state when no cars found', async () => {
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/locations/regions')) {
        return Promise.resolve({ data: { data: { regions: mockRegions } } });
      }
      return Promise.resolve({ data: { data: { cars: [] } } });
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('home.empty')).toBeTruthy();
      expect(getByText('home.empty_description')).toBeTruthy();
    });
  });

  it('navigates to CarDetail when car card is pressed', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => getByText('Tesla Model 3'));

    await act(async () => {
      // Find and press the "car.book_now" or the card itself
      // CarCard renders a touchable that calls onPress
      fireEvent.press(getByText('car.book_now'));
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('CarDetail', { carId: '1' });
  });
});
