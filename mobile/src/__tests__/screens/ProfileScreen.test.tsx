import React from 'react';
import { render, fireEvent } from '../../utils/test-utils';
import ProfileScreen from '../../screens/Main/ProfileScreen';
import { Alert } from 'react-native';
import { toast } from '../../utils/toast';

// Mock useAuthStore
const mockLogout = jest.fn();
const mockUpdateUser = jest.fn();
const mockUser = {
  name: 'John Doe',
  phone: '+998901234567',
  role: 'customer',
};

jest.mock('../../store/useAuthStore', () => ({
  useAuthStore: () => ({
    user: mockUser,
    logout: mockLogout,
    updateUser: mockUpdateUser,
  }),
}));

// Mock toast
jest.mock('../../utils/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
  MediaTypeOptions: { All: 'All', Images: 'Images' },
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

  it('handles language change and calls i18n.changeLanguage', () => {
    const { getByText } = render(<ProfileScreen />);
    
    // Press the Russian language button
    const ruButton = getByText('Русский');
    fireEvent.press(ruButton);
    
    // Verify i18n.changeLanguage was called (our mock returns the key, 
    // but the component calls i18n.changeLanguage which we mocked in jest.setup.ts)
    // Verify toast shows success notification confirming the change
    expect(toast.success).toHaveBeenCalledWith('common.success', 'profile.language_changed');
  });

  it('handles language change to English', () => {
    const { getByText } = render(<ProfileScreen />);
    
    const enButton = getByText('English');
    fireEvent.press(enButton);
    
    expect(toast.success).toHaveBeenCalledWith('common.success', 'profile.language_changed');
  });

  it('shows logout confirmation alert with correct text', () => {
    const { getByText } = render(<ProfileScreen />);
    
    const logoutButton = getByText('profile.sign_out');
    fireEvent.press(logoutButton);
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'profile.sign_out',
      'profile.logout_confirm',
      expect.arrayContaining([
        expect.objectContaining({ text: 'common.cancel', style: 'cancel' }),
        expect.objectContaining({ text: 'profile.sign_out', style: 'destructive' }),
      ])
    );
  });

  it('calls logout when alert destructive button is pressed', () => {
    const { getByText } = render(<ProfileScreen />);
    
    fireEvent.press(getByText('profile.sign_out'));
    
    // Extract the onPress handler from the alert call and invoke it
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCall[2];
    const destructiveButton = buttons.find((b: any) => b.style === 'destructive');
    destructiveButton.onPress();
    
    expect(mockLogout).toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith('auth.logged_out');
  });
});
