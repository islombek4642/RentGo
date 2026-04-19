// @ts-ignore
global.__ExpoImportMetaRegistry = {};

// Polyfill structuredClone for Node versions < 17 or environments that missing it
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}

import '@testing-library/jest-native/extend-expect';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const mockIcon = (name: string) => (props: any) => React.createElement(Text, props, name);
  return {
    Clock: mockIcon('Clock'),
    MapPin: mockIcon('MapPin'),
    ChevronRight: mockIcon('ChevronRight'),
    ChevronLeft: mockIcon('ChevronLeft'),
    LogOut: mockIcon('LogOut'),
    Languages: mockIcon('Languages'),
    CalendarCheck: mockIcon('CalendarCheck'),
    ShieldCheck: mockIcon('ShieldCheck'),
    ArrowLeft: mockIcon('ArrowLeft'),
    ArrowRight: mockIcon('ArrowRight'),
    Info: mockIcon('Info'),
    AlertCircle: mockIcon('AlertCircle'),
    Car: mockIcon('Car'),
    Calendar: mockIcon('Calendar'),
    Search: mockIcon('Search'),
    X: mockIcon('X'),
    Users: mockIcon('Users'),
    Settings: mockIcon('Settings'),
    CheckCircle2: mockIcon('CheckCircle2'),
    Home: mockIcon('Home'),
    Phone: mockIcon('Phone'),
    User: mockIcon('User'),
    Eye: mockIcon('Eye'),
    EyeOff: mockIcon('EyeOff'),
    Globe: mockIcon('Globe'),
  };
});

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock axios/api
jest.mock('./src/services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Expo constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiUrl: 'http://localhost:3000/api/v1',
    },
  },
  manifest: {},
}));

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(),
}));
