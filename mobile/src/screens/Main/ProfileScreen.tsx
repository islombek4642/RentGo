import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, SPACING, TYPOGRAPHY, SIZES } from '../../constants/theme';
import { toast } from '../../utils/toast';
import { useTranslation } from 'react-i18next';
import { 
  LogOut, 
  LayoutDashboard, 
  Car, 
  PlusCircle, 
  Globe, 
  User, 
  Phone, 
  ChevronRight,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Clock,
  Camera
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

const LANGUAGES = [
  { code: 'uz', label: 'Oʻzbek' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

const ProfileScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { user, logout, updateUser } = useAuthStore();

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    toast.success(t('common.success'), t('profile.language_changed'));
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
            toast.info(t('auth.logged_out'));
          } 
        }
      ]
    );
  };

  const uploadLicense = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.error(t('common.error'), 'Need permissions to access photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      const formData = new FormData();
      
      // @ts-ignore
      formData.append('license', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: 'license.jpg',
      });

      try {
        toast.info(t('common.loading'));
        const response = await api.post('/users/verify', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (response.data.status === 'success') {
          updateUser(response.data.data.user);
          toast.success(t('profile.verification_success'));
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(t('common.error'), error.response?.data?.message || t('common.error_occurred'));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('nav.profile')}</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Avatar & Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.userName}>{user?.name || t('common.user')}</Text>
          <View style={styles.phoneContainer}>
            <Phone size={14} color={COLORS.gray[500]} />
            <Text style={styles.userPhone}>{user?.phone || ''}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || t('common.user')}</Text>
          </View>
        </View>

        {/* Verification Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={18} color={COLORS.text.primary} />
            <Text style={styles.sectionTitle}>{t('profile.verify_title')}</Text>
          </View>
          
          <View style={[styles.verificationCard, user?.is_verified && styles.verifiedCard]}>
            {user?.is_verified ? (
              <>
                <View style={[styles.statusIcon, { backgroundColor: COLORS.success + '20' }]}>
                  <CheckCircle2 size={24} color={COLORS.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.verificationStatusText}>{t('profile.verified')}</Text>
                  <Text style={styles.verificationDescText}>{t('profile.verify_desc_success') || 'Your account is verified for renting.'}</Text>
                </View>
              </>
            ) : user?.license_image_url ? (
              <>
                <View style={[styles.statusIcon, { backgroundColor: COLORS.warning + '20' }]}>
                  <Clock size={24} color={COLORS.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.verificationStatusText}>{t('profile.pending_verification')}</Text>
                  <Text style={styles.verificationDescText}>{t('profile.verify_desc_pending') || 'We are reviewing your license. Please wait.'}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={{ flex: 1 }}>
                  <Text style={styles.verificationDescText}>{t('profile.verify_desc')}</Text>
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={uploadLicense}
                  >
                    <Camera size={18} color={COLORS.white} />
                    <Text style={styles.uploadButtonText}>{t('profile.upload_license')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
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

        {/* Owner Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Car size={18} color={COLORS.text.primary} />
            <Text style={styles.sectionTitle}>{t('profile.owner_section') || 'Owner'}</Text>
          </View>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('OwnerDashboard')}
          >
            <View style={styles.menuIconBox}>
              <LayoutDashboard size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuText}>{t('profile.owner_dashboard')}</Text>
            <ChevronRight size={18} color={COLORS.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('MyCars')}
          >
            <View style={styles.menuIconBox}>
              <Car size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuText}>{t('profile.my_cars')}</Text>
            <ChevronRight size={18} color={COLORS.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.highlightedItem]}
            onPress={() => navigation.navigate('AddCar')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: COLORS.primary + '15' }]}>
              <PlusCircle size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuText}>{t('profile.list_car')}</Text>
            <ChevronRight size={18} color={COLORS.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>{t('profile.sign_out')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primary + '15',
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
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  languageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
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
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  highlightedItem: {
    borderColor: COLORS.primary + '40',
    backgroundColor: COLORS.primary + '05',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: SIZES.radius.sm,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  menuText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    flex: 1,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.error + '10',
    marginTop: SPACING.sm,
    gap: 8,
  },
  logoutText: {
    ...TYPOGRAPHY.button,
    color: COLORS.error,
  },
  verificationCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  verifiedCard: {
    borderColor: COLORS.success + '50',
    backgroundColor: COLORS.success + '05',
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationStatusText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  verificationDescText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  uploadButton: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: SIZES.radius.sm,
    gap: 8,
  },
  uploadButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
});

export default ProfileScreen;
