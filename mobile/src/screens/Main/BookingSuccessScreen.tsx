import * as React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { CheckCircle2, Home } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SIZES } from '../../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingSuccess'>;

/**
 * BookingSuccessScreen Component
 * Minimalism-focused confirmation UI.
 */
const BookingSuccessScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { carName, totalPrice, dates } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle2 size={80} color={COLORS.success} />
        </View>

        <Text style={styles.title}>{t('booking.success_title') || 'Reservation Confirmed!'}</Text>
        <Text style={styles.subtitle}>
          {t('booking.success_subtitle') || 'Your booking request has been submitted successfully.'}
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('car.model')}</Text>
            <Text style={styles.detailValue}>{carName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('booking.dates')}</Text>
            <Text style={styles.detailValue}>{dates}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('booking.total_price')}</Text>
            <Text style={[styles.detailValue, { color: COLORS.primary, fontWeight: '700' }]}>
              ${totalPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Home size={20} color={COLORS.white} />
          <Text style={styles.buttonText}>{t('common.go_home') || 'Go to Home'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  detailLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  detailValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  homeButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 16,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    marginLeft: 10,
  },
});

export default BookingSuccessScreen;
