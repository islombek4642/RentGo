import Constants from 'expo-constants';

/**
 * Mobile configuration.
 * For local development, use your machine's local IP address instead of localhost.
 */
const CONFIG = {
  // Replace with your local machine's IP address (e.g., http://192.168.x.x:3000)
  // Current detected IP: 192.168.183.15
  API_URL: Constants.expoConfig?.extra?.apiUrl || 'http://192.168.183.15:3000/api/v1',
  DEFAULT_LANG: 'uz',
  TIMEOUT: 10000,
};

export default CONFIG;
