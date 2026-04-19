import React from 'react';
import { render, fireEvent, waitFor } from '../../utils/test-utils';
import HomeScreen from '../../screens/Main/HomeScreen';
import api from '../../services/api';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and fetches cars', async () => {
    const mockCars = [
      {
        id: '1',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2023,
        price_per_day: '150',
        location: 'Tashkent',
        images: ['https://example.com/tesla.jpg'],
      },
    ];

    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          cars: mockCars,
        },
      },
    });

    const { getByText, getByPlaceholderText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    // Initial state might be loading, so wait for greeting
    await waitFor(() => {
      expect(getByText('home.greeting')).toBeTruthy();
      expect(getByText('home.title')).toBeTruthy();
      expect(getByText('Tesla Model 3')).toBeTruthy();
    });
  });

  it('handles search input', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          cars: [],
        },
      },
    });

    const { getByPlaceholderText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    // Wait for search to appear (after loader)
    let searchInput: any;
    await waitFor(() => {
      searchInput = getByPlaceholderText('home.search');
      expect(searchInput).toBeTruthy();
    });

    fireEvent.changeText(searchInput, 'Audi');
    
    // In our implementation, tempSearch is updated on changeText, 
    // but searchQuery is updated on onSubmitEditing
    fireEvent(searchInput, 'onSubmitEditing');

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('brand=Audi'));
    });
  });

  it('handles city filter selection', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          cars: [],
        },
      },
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    // Wait for cities to appear
    let cityButton: any;
    await waitFor(() => {
      cityButton = getByText('Tashkent');
      expect(cityButton).toBeTruthy();
    });

    fireEvent.press(cityButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('location=Tashkent'));
    });
  });

  it('shows empty state when no cars found', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          cars: [],
        },
      },
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('home.empty')).toBeTruthy();
    });
  });
});
