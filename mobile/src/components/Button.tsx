import * as React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  ViewStyle,
  TextStyle
} from 'react-native';
import { COLORS, SPACING, SIZES, TYPOGRAPHY } from '../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  loading, 
  variant = 'primary', 
  style, 
  textStyle, 
  disabled,
  ...props 
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: COLORS.secondary };
      case 'outline':
        return { 
          backgroundColor: 'transparent', 
          borderWidth: 1, 
          borderColor: COLORS.primary 
        };
      case 'danger':
        return { backgroundColor: COLORS.error };
      default:
        return { backgroundColor: COLORS.primary };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return COLORS.primary;
    return COLORS.white;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      style={[
        styles.button, 
        getVariantStyle(), 
        (disabled || loading) && styles.disabled,
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: SIZES.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  text: {
    ...TYPOGRAPHY.button,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
