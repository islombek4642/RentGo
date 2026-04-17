import * as React from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps, 
  ViewStyle,
  TouchableOpacity
} from 'react-native';
import { COLORS, SPACING, SIZES, TYPOGRAPHY } from '../constants/theme';

import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  containerStyle, 
  onBlur, 
  onFocus, 
  isPassword,
  secureTextEntry,
  ...props 
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View 
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          !!error && styles.errorInput
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.gray[400]}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword ? (
              <EyeOff size={20} color={COLORS.gray[500]} />
            ) : (
              <Eye size={20} color={COLORS.gray[500]} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  inputContainer: {
    height: 56,
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    flex: 1,
  },
  focused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
});

export default Input;
