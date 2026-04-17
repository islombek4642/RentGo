import * as React from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface SkeletonProps {
  width?: number | any;
  height?: number | any;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton Primitive Component
 * Providing a reusable shimmering base for loading states.
 */
const Skeleton: React.FC<SkeletonProps> = ({ 
  width, 
  height, 
  borderRadius = 4, 
  style 
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View 
      style={[
        styles.skeleton, 
        { width, height, borderRadius, opacity },
        style
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.gray[300],
  },
});

export default Skeleton;
