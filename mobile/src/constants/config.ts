import Constants from 'expo-constants';

/**
 * Auto-detect backend API URL based on environment.
 * Works on any computer without manual IP configuration.
 */
const getApiUrl = (): string => {
  // Try to get host from Expo manifest (works in development mode)
  const manifest = Constants.expoConfig;
  const hostUri = manifest?.hostUri; // e.g., "192.168.1.5:8081" or "localhost:8081"
  
  if (hostUri) {
    // Extract IP from hostUri (remove port)
    const host = hostUri.split(':')[0];
    // Exclude localhost for real devices (use actual IP instead)
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3000/api/v1`;
    }
  }
  
  // Check platform for emulator/simulator
  const isDevice = Constants.isDevice;
  const platform = Constants.platform;
  
  if (platform?.android && !isDevice) {
    // Android emulator
    return 'http://10.0.2.2:3000/api/v1';
  }
  
  if (platform?.ios && !isDevice) {
    // iOS simulator
    return 'http://localhost:3000/api/v1';
  }
  
  // Fallback: try common local IP patterns or localhost
  // Most dev environments work with localhost if backend is on same machine
  return 'http://localhost:3000/api/v1';
};

const CONFIG = {
  API_URL: getApiUrl(),
  DEFAULT_LANG: 'uz',
  TIMEOUT: 10000,
};

console.log('API_URL:', CONFIG.API_URL); // Debug log to verify

export default CONFIG;
