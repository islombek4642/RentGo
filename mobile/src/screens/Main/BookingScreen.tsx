import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY, SIZES } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import api from '../../services/api';
import { Calendar as CalendarIcon, Info } from 'lucide-react-native';
import { toast } from '../../utils/toast';

import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirm'>;

export default function BookingScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const carId = route.params?.carId;
  
  // Use 'en-CA' to get YYYY-MM-DD format in local time
  const getTodayStr = () => new Date().toLocaleDateString('en-CA');
  
  const [car, setCar] = React.useState<any>(null);
  const [startDate, setStartDate] = React.useState(getTodayStr());
  const [endDate, setEndDate] = React.useState(getTodayStr());
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!carId) {
      toast.error(t('common.error'), t('car.not_found'));
      navigation.goBack();
      return;
    }

    const fetchCar = async () => {
      try {
        const response = await api.get(`/cars/${carId}`);
        setCar(response.data.data.car);
      } catch (error) {
        Alert.alert(t('common.error'), t('car.not_found'));
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId, navigation, t]);

  const calculateTotalPrice = () => {
    if (!car) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays * parseFloat(car.price_per_day);
  };

  const handleBooking = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const totalPrice = calculateTotalPrice();
      
      const response = await api.post('/bookings', {
        car_id: carId,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice
      });

      // Navigate to success screen ONLY on 201 success
      if (response.status === 201) {
        navigation.navigate('BookingSuccess', { 
          bookingId: response.data.data.booking.id,
          carName: `${car.brand} ${car.model}`,
          totalPrice: totalPrice,
          dates: `${startDate} → ${endDate}`
        });
      }
      
    } catch (error: any) {
      const message = error.response?.data?.message || t('booking.failed_msg');
      toast.error(t('common.error'), message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>{car.brand} {car.model}</Text>
            <Text style={styles.cardSubtitle}>{car.location}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CalendarIcon size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>{t('booking.dates')}</Text>
            </View>
            
            <Input
              label={t('booking.start_date')}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="2026-06-01"
            />
            <Input
              label={t('booking.end_date')}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2026-06-05"
            />
          </View>

          <View style={styles.infoBox}>
            <Info size={16} color={COLORS.gray[500]} />
            <Text style={styles.infoText}>
              {t('booking.insurance_info')}
            </Text>
          </View>

          <View style={styles.priceBreakdown}>
            <Text style={styles.sectionTitle}>{t('booking.price_details')}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('booking.daily_rate')}</Text>
              <Text style={styles.priceValue}>${parseFloat(car.price_per_day).toLocaleString()}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>{t('booking.total_price')}</Text>
              <Text style={styles.totalValue}>${calculateTotalPrice().toLocaleString()}</Text>
            </View>
          </View>

          <Button 
            title={t('booking.confirm')} 
            onPress={handleBooking} 
            loading={submitting} 
            style={styles.confirmButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: SIZES.radius.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  cardTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.xl,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[100],
    padding: SPACING.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[600],
    marginLeft: 8,
    flex: 1,
  },
  priceBreakdown: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: SIZES.radius.lg,
    marginBottom: SPACING.xl,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  priceLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  priceValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  totalLabel: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  totalValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  confirmButton: {
    marginTop: SPACING.sm,
  },
});

