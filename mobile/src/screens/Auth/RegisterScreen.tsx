import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ScrollView
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
import { ChevronLeft } from 'lucide-react-native';

import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRegister = async () => {
    if (loading) return;
    if (!name || !phone || !password) {
      toast.error(t('common.error'), t('auth.fill_all'));
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/register', { name, phone, password });
      
      const { user, tokens } = response.data.data;
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      toast.success(t('common.success'), t('auth.register_success') || 'Account created successfully!');
      
    } catch (error: any) {
      const message = error.response?.data?.message || t('auth.register_failed');
      toast.error(t('common.error'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={COLORS.black} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.create_account')}</Text>
            <Text style={styles.subtitle}>{t('auth.register_subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('auth.name')}
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
            />
            <Input
              label={t('auth.phone')}
              placeholder="+998 90 123 45 67"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              isPassword
            />

            <View style={styles.terms}>
              <Text style={styles.termsText}>
                {t('auth.terms')}
              </Text>
            </View>

            <Button 
              title={t('auth.sign_up')} 
              onPress={handleRegister} 
              loading={loading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.already_account')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>{t('auth.sign_in')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
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
  terms: {
    marginBottom: SPACING.xl,
  },
  termsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
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

export default RegisterScreen;
