import React from 'react';
import { render, fireEvent } from '../../utils/test-utils';
import ProfileScreen from '../../screens/Main/ProfileScreen';
import { useAuthStore } from '../../store/useAuthStore';
import { Alert } from 'react-native';

// Mock useAuthStore
const mockLogout = jest.fn();
const mockUser = {
  name: 'John Doe',
  phone: '+998901234567',
  role: 'customer',
};

jest.mock('../../store/useAuthStore', () => ({
  useAuthStore: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user information correctly', () => {
    const { getByText } = render(<ProfileScreen />);
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('+998901234567')).toBeTruthy();
    expect(getByText('customer')).toBeTruthy();
  });

  it('handles language change', () => {
    const { getByText } = render(<ProfileScreen />);
    
    const uzButton = getByText('Oʻzbek');
    fireEvent.press(uzButton);
    
    // We mocked useTranslation, it should handle the language change
    // Our mock simple returns the key, but we can verify the interaction
  });

  it('shows logout confirmation alert', () => {
    const { getByText } = render(<ProfileScreen />);
    
    const logoutButton = getByText('profile.sign_out');
    fireEvent.press(logoutButton);
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'profile.sign_out',
      'profile.logout_confirm',
      expect.any(Array)
    );
  });
});
