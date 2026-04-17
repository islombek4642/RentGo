import * as React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { useToastStore } from '../store/useToastStore';
import { useAppStore } from '../store/useAppStore';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Custom Toast Component (Pro Version)
 * Supporting queuing, haptics, and adaptive multi-line layouts.
 */
const Toast: React.FC = () => {
  const { current, hide, processNext } = useToastStore();
  const isOffline = useAppStore((state) => state.isOffline);
  const insets = useSafeAreaInsets();
  const animation = React.useRef(new Animated.Value(0)).current;

  // Trigger Haptics based on type
  const triggerHaptics = React.useCallback(async (type: string) => {
    try {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
      }
    } catch (e) {
      // Fallback for environments where haptics are not available
    }
  }, []);

  React.useEffect(() => {
    if (current) {
      // Entry Animation
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 100,
      }).start();

      triggerHaptics(current.type);

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        dismiss();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // If no current toast, ensure animation is reset
      animation.setValue(0);
    }
  }, [current?.id, triggerHaptics, animation]);

  const dismiss = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      hide(); // Triggers store cleanup
    });
  };

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, isOffline ? 50 : 0],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!current) return null;

  const getIcon = () => {
    if (!current) return null;
    switch (current.type) {
      case 'success': return <CheckCircle2 size={24} color={COLORS.success} />;
      case 'error': return <AlertCircle size={24} color={COLORS.error} />;
      default: return <Info size={24} color={COLORS.primary} />;
    }
  };

  const getBorderColor = () => {
    if (!current) return COLORS.primary;
    switch (current.type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { 
          paddingTop: insets.top + SPACING.sm, 
          transform: [{ translateY }],
          opacity: opacity
        }
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={dismiss}
        style={[styles.container, { borderLeftColor: getBorderColor() }]}
      >
        <View style={styles.iconArea}>{getIcon()}</View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{current?.title}</Text>
          {current?.message && (
            <Text style={styles.message} numberOfLines={4}>
              {current.message}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={dismiss}>
          <X size={16} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    zIndex: 10000,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.medium,
    alignItems: 'center',
    maxHeight: SCREEN_HEIGHT * 0.2, // Safe height limit
  },
  iconArea: {
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  message: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: 2,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
    marginLeft: SPACING.sm,
  },
});

export default Toast;
