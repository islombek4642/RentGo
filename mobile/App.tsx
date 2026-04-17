import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from './src/components/Toast';
import OfflineBanner from './src/components/OfflineBanner';

import { NavigationContainer } from '@react-navigation/native';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({});
  const [i18nInitialized, setI18nInitialized] = React.useState(i18n.isInitialized);

  React.useEffect(() => {
    if (!i18n.isInitialized) {
      const handleInitialized = () => setI18nInitialized(true);
      i18n.on('initialized', handleInitialized);
      return () => i18n.off('initialized', handleInitialized);
    }
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (fontsLoaded && i18nInitialized) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, i18nInitialized]);

  // Keep the provider tree stable to prevent full resets during Hot Reload
  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        {(fontsLoaded && i18nInitialized) ? (
          <View style={styles.container} onLayout={onLayoutRootView}>
            <StatusBar style="dark" />
            <OfflineBanner />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </View>
        ) : (
          <View style={styles.container} />
        )}
        <Toast />
      </I18nextProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
