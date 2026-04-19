import React from 'react';
import { render, fireEvent, waitFor } from '../../utils/test-utils';
import LoginScreen from '../../screens/Auth/LoginScreen';
import api from '../../services/api';
import { toast } from '../../utils/toast';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock useAuthStore
const mockSetAuth = jest.fn();
jest.mock('../../store/useAuthStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { setAuth: mockSetAuth };
    return selector(state);
  },
}));

// Mock toast
jest.mock('../../utils/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('auth.welcome')).toBeTruthy();
    expect(getByPlaceholderText('+998 90 123 45 67')).toBeTruthy();
    expect(getByPlaceholderText('••••••••')).toBeTruthy();
  });

  it('shows error if fields are empty', async () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    fireEvent.press(getByText('auth.sign_in'));

    expect(toast.error).toHaveBeenCalledWith('common.error', 'auth.fill_all');
  });

  it('handles successful login', async () => {
    const mockResponse = {
      data: {
        data: {
          user: { id: '1', name: 'Test User' },
          tokens: { accessToken: 'access', refreshToken: 'refresh' },
        },
      },
    };

    (api.post as jest.Mock).mockResolvedValue(mockResponse);

    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    fireEvent.changeText(getByPlaceholderText('+998 90 123 45 67'), '901234567');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
    fireEvent.press(getByText('auth.sign_in'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        phone: '901234567',
        password: 'password123',
      });
      expect(mockSetAuth).toHaveBeenCalledWith(
        mockResponse.data.data.user,
        'access',
        'refresh'
      );
      expect(toast.success).toHaveBeenCalledWith('common.success', expect.any(String));
    });
  });

  it('handles login failure', async () => {
    const errorMessage = 'Invalid credentials';
    (api.post as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    fireEvent.changeText(getByPlaceholderText('+998 90 123 45 67'), '901234567');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'wrongpassword');
    fireEvent.press(getByText('auth.sign_in'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('common.error', errorMessage);
    });
  });

  it('navigates to Register screen', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    fireEvent.press(getByText('auth.sign_up'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });
});
