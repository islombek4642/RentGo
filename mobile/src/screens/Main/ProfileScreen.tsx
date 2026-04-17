import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, SPACING, TYPOGRAPHY, SIZES } from '../../constants/theme';
import api from '../../services/api';
import Skeleton from '../../components/Skeleton/Skeleton';
import EmptyState from '../../components/EmptyState';
import { toast } from '../../utils/toast';
import { useTranslation } from 'react-i18next';
import { LogOut, Clock, Languages, Globe, Calendar, AlertCircle, User, Phone } from 'lucide-react-native';

const LANGUAGES = [
  { code: 'uz', label: 'Oʻzbek' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    toast.success(t('common.success'), t('profile.language_changed') || 'Language updated');
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.sign_out'),
      t('profile.logout_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('profile.sign_out'), 
          style: 'destructive', 
          onPress: () => {
            logout();
            toast.info(t('auth.logged_out') || 'Logged out successfully');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('nav.profile')}</Text>
      </View>
      <View style={styles.content}>
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <View style={styles.phoneContainer}>
            <Phone size={14} color={COLORS.gray[500]} />
            <Text style={styles.userPhone}>{user?.phone || ''}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'User'}</Text>
          </View>
        </View>

        {/* Language Selection Section */}
        <View style={styles.languageSection}>
          <View style={styles.sectionHeader}>
            <Globe size={18} color={COLORS.text.primary} />
            <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          </View>
          <View style={styles.languageGrid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity 
                key={lang.code}
                style={[
                  styles.languageButton,
                  i18n.language === lang.code && styles.activeLanguage
                ]}
                onPress={() => changeLanguage(lang.code)}
              >
                <Text style={[
                  styles.languageLabel,
                  i18n.language === lang.code && styles.activeLanguageLabel
                ]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action List */}
        <View style={styles.actionList}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>{t('profile.sign_out')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userPhone: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[500],
    marginLeft: 6,
  },
  roleBadge: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  languageSection: {
    marginTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  languageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.radius.sm,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  activeLanguage: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  languageLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  activeLanguageLabel: {
    color: COLORS.primary,
  },
  section: {
    flex: 1,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  bookingCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  carName: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[600],
    marginLeft: 6,
  },
  bookingPrice: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  emptyBookings: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[400],
    textAlign: 'center',
  },
  actionList: {
    paddingVertical: SPACING.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.error + '10',
  },
  logoutText: {
    ...TYPOGRAPHY.button,
    color: COLORS.error,
    marginLeft: 10,
  },
});

export default ProfileScreen;
