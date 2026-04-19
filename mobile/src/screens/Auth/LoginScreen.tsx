import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../utils/toast';

import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (loading) return;
    if (!phone || !password) {
      toast.error(t('common.error'), t('auth.fill_all'));
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/login', { phone, password });
      
      const { user, tokens } = response.data.data;
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      toast.success(t('common.success'), t('auth.login_success'));
      
    } catch (error: any) {
      const message = error.response?.data?.message || t('auth.login_failed');
      toast.error(t('common.error'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.welcome')}</Text>
          <Text style={styles.subtitle}>{t('auth.welcome_subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.phone')}
            placeholder="+998 90 123 45 67"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            isPassword
          />

          <TouchableOpacity 
            onPress={() => {}} 
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>{t('auth.forgot_password')}</Text>
          </TouchableOpacity>

          <Button 
            title={t('auth.sign_in')} 
            onPress={handleLogin} 
            loading={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.no_account')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>{t('auth.sign_up')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  link: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

