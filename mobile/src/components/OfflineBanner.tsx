import * as React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { useNetwork } from '../hooks/useNetwork';
import { useTranslation } from 'react-i18next';

/**
 * OfflineBanner Component
 * Appears at the top of the screen when internet connection is lost.
 */
import { useAppStore } from '../store/useAppStore';

const OfflineBanner: React.FC = () => {
  const { isOffline } = useNetwork();
  const setOffline = useAppStore((state) => state.setOffline);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  React.useEffect(() => {
    setOffline(isOffline);
  }, [isOffline, setOffline]);

  const animation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isOffline ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline, animation]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { paddingTop: insets.top, transform: [{ translateY }] }
      ]}
    >
      <View style={styles.content}>
        <WifiOff size={16} color={COLORS.white} />
        <Text style={styles.text}>{t('common.offline_message') || 'No Internet Connection'}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.error,
    zIndex: 9999,
    ...TYPOGRAPHY.body2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  text: {
    color: COLORS.white,
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 12,
  },
});

export default OfflineBanner;
