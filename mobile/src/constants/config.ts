import Constants from 'expo-constants';

/**
 * Auto-detect backend API URL based on environment.
 * Works on any computer without manual IP configuration.
 */
// ❗ SERVER IP MANZILINI SHU YERGA YOZING (deploy.sh ko'rsatgan manzil)
const PRODUCTION_SERVER_URL = ''; 

const getApiUrl = (): string => {
  // Agar yuqorida server manzili yozilgan bo'lsa, undan foydalanish
  if (PRODUCTION_SERVER_URL) {
    return PRODUCTION_SERVER_URL;
  }

  // Development (Expo/Emulator) rejimi uchun avtomatik aniqlash
  const manifest = Constants.expoConfig;
  const hostUri = manifest?.hostUri;
  
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3000/api/v1`;
    }
  }
  
  const isDevice = Constants.isDevice;
  const platform = Constants.platform;
  
  if (platform?.android && !isDevice) {
    return 'http://10.0.2.2:3000/api/v1';
  }
  
  return 'http://localhost:3000/api/v1';
};

const CONFIG = {
  API_URL: getApiUrl(),
  DEFAULT_LANG: 'uz',
  TIMEOUT: 15000, // Internet sekin bo'lsa kutish vaqtini biroz oshirdik
};

console.log('API_URL:', CONFIG.API_URL); // Debug log to verify

export default CONFIG;
