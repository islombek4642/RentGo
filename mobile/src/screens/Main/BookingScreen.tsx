import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY, SIZES } from '../../constants/theme';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import api from '../../services/api';
import { Calendar as CalendarIcon, Info, AlertCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { toast } from '../../utils/toast';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { formatDateLocal, parseDateLocal } from '../../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirm'>;

export default function BookingScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const carId = route.params?.carId;
  const insets = useSafeAreaInsets();
  const todayStr = formatDateLocal(new Date());

  const [car, setCar] = React.useState<any>(null);
  const [startDate, setStartDate] = React.useState(todayStr);
  const [endDate, setEndDate] = React.useState<string | null>(null);

  const [bookingConflict, setBookingConflict] = React.useState<{ start: string, end: string } | null>(null);
  const [nextAvailableDate, setNextAvailableDate] = React.useState<string | null>(null);
  const [carBookedDates, setCarBookedDates] = React.useState<any[]>([]);

  const [billingDays, setBillingDays] = React.useState(1);
  const [totalPrice, setTotalPrice] = React.useState(0);
  
  const [hasPendingOverlap, setHasPendingOverlap] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    let pendingMatch = false;
    if (startDate && endDate && carBookedDates.length) {
      const sDate = parseDateLocal(startDate);
      const eDate = parseDateLocal(endDate);
      // Half-open interval overlap: [sDate, eDate) vs [bStart, bEnd)
      // Overlap iff sDate < bEnd AND eDate > bStart
      for (const b of carBookedDates) {
        if (b.status === 'pending') {
          const bStart = b.start_date;
          const bEnd = b.end_date;
          if (startDate < bEnd && endDate > bStart) {
             pendingMatch = true;
             break;
          }
        }
      }
    }
    setHasPendingOverlap(pendingMatch);
  }, [startDate, endDate, carBookedDates]);

  React.useEffect(() => {
    if (!carId) {
      toast.error(t('common.error'), t('car.not_found'));
      navigation.goBack();
      return;
    }

    const fetchData = async () => {
      try {
        const [carRes, heatmapRes] = await Promise.all([
          api.get(`/cars/${carId}`),
          api.get(`/bookings/car/${carId}`)
        ]);
        setCar(carRes.data.data.car);
        setCarBookedDates(heatmapRes.data.data.dates);
      } catch (error) {
        Alert.alert(t('common.error'), t('car.not_found'));
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [carId, navigation, t]);

  React.useEffect(() => {
    if (car && startDate && endDate) {
      const start = parseDateLocal(startDate);
      const end = parseDateLocal(endDate);
      if (start && end) {
        // Half-open interval: days = end - start (no +1)
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        setBillingDays(Math.max(diffDays, 1));
        setTotalPrice(Math.max(diffDays, 1) * parseFloat(car.price_per_day));
      }
    } else if (car) {
      setBillingDays(0);
      setTotalPrice(0);
    }
  }, [startDate, endDate, car]);

  const handleBooking = async () => {
    if (submitting) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBookingConflict(null);
    setNextAvailableDate(null);

    try {
      setSubmitting(true);

      if (!endDate || endDate <= startDate) {
        toast.error(t('common.error'), t('booking.select_end_date') || 'Please select an end date');
        setSubmitting(false);
        return;
      }

      const response = await api.post('/bookings', {
        car_id: carId,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice
      });

      if (response.status === 201) {
        navigation.navigate('BookingSuccess', {
          bookingId: response.data.data.booking.id,
          carName: `${car.brand} ${car.model}`,
          totalPrice: totalPrice,
          dates: `${startDate} → ${endDate || startDate}`
        });
      }

    } catch (error: any) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (error.response?.data?.details?.code === 'BOOKING_CONFLICT') {
        setBookingConflict(error.response.data.details.conflictRange);
        setNextAvailableDate(error.response.data.details.nextAvailableDate);
        toast.error(t('booking.conflict_title'), error.response.data.message);
      } else {
        const message = error.response?.data?.message || t('booking.failed_msg');
        toast.error(t('common.error'), message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onDayPress = (day: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const selected = day.dateString;
    setBookingConflict(null);
    setNextAvailableDate(null);

    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (selected > startDate) {
        setEndDate(selected);
      } else {
        setStartDate(selected);
        setEndDate(null);
      }
    }
  };

  const handleSmartBook = () => {
    if (nextAvailableDate) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const start = parseDateLocal(startDate);
      const end = parseDateLocal(endDate);
      const diffDays = (start && end) ?
        Math.round(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) : 1;

      setStartDate(nextAvailableDate);
      const d = parseDateLocal(nextAvailableDate);
      if (d) {
        d.setDate(d.getDate() + diffDays);
        setEndDate(formatDateLocal(d));
      }
      setBookingConflict(null);
      setNextAvailableDate(null);
    }
  };

  const getMarkedDates = () => {
    const marks: any = {};

    // 1. Draw Heatmap from backend
    // end_date is exclusive (checkout day) — do NOT mark it as occupied
    carBookedDates.forEach((b: any) => {
      let curr = parseDateLocal(b.start_date);
      const end = parseDateLocal(b.end_date);
      const isConfirmed = b.status === 'confirmed';
      const color = isConfirmed ? COLORS.error + '40' : COLORS.warning + '40';
      const textColor = isConfirmed ? COLORS.error : COLORS.warning;

      // Half-open: mark [start, end) — end_date itself is free (checkout day)
      if (curr && end) {
        while (curr < end) {
          const dateStr = formatDateLocal(curr);
          marks[dateStr] = {
            color,
            textColor,
            disabled: isConfirmed,
            disableTouchEvent: isConfirmed,
          };
          curr.setDate(curr.getDate() + 1);
        }
      }
    });

    // 2. Draw user selection (overriding pending cells visually)
    if (startDate) {
      marks[startDate] = { ...marks[startDate], startingDay: true, color: COLORS.primary, textColor: 'white' };
    }
    if (endDate && endDate !== startDate) {
      marks[endDate] = { ...marks[endDate], endingDay: true, color: COLORS.primary, textColor: 'white' };
      let curr = parseDateLocal(startDate);
      if (curr) {
        curr.setDate(curr.getDate() + 1);
        const endMarker = parseDateLocal(endDate);
        if (endMarker) {
          while (curr < endMarker) {
            const dateStr = formatDateLocal(curr);
            marks[dateStr] = { ...marks[dateStr], color: COLORS.primary, textColor: 'white', opacity: 0.5 };
            curr.setDate(curr.getDate() + 1);
          }
        }
      }
    }
    return marks;
  };

  return (
    <View style={styles.container}>
      {/* Custom Fixed Header */}
      <View style={[styles.screenHeader, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('booking.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
        {loading ? (
          <Loader />
        ) : (
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

                <View style={styles.calendarWrapper}>
                  <Calendar
                    enableSwipeMonths={false}
                    hideArrows={false}
                    markingType={'period'}
                    markedDates={getMarkedDates()}
                    onDayPress={onDayPress}
                    minDate={todayStr}
                    renderHeader={(date) => (
                      <View style={styles.customCalendarHeader}>
                        <Text style={styles.calendarMonthText}>
                          {date.toString('MMMM yyyy')}
                        </Text>
                      </View>
                    )}
                    renderArrow={(direction: 'left' | 'right') => (
                      direction === 'left' ? 
                        <ChevronLeft size={24} color={COLORS.primary} /> : 
                        <ChevronRight size={24} color={COLORS.primary} />
                    )}
                    theme={{
                      todayTextColor: COLORS.primary,
                      arrowColor: COLORS.primary,
                      textDayFontSize: 14,
                      textMonthFontSize: 16,
                      textDayHeaderFontSize: 14,
                      textDayFontWeight: '400',
                      textMonthFontWeight: '700',
                      textDayHeaderFontWeight: '600',
                      calendarBackground: COLORS.white,
                    }}
                  />
                </View>

                {hasPendingOverlap && !bookingConflict && (
                  <View style={[styles.conflictBanner, { backgroundColor: COLORS.warning + '10', borderColor: COLORS.warning + '40' }]}>
                    <View style={styles.conflictHeader}>
                      <AlertCircle size={20} color={COLORS.warning} />
                      <Text style={[styles.conflictTitle, { color: COLORS.warning }]}>
                        {t('booking.pending_title')}
                      </Text>
                    </View>
                    <Text style={[styles.conflictText, { color: COLORS.warning }]}>
                      {t('booking.pending_msg')}
                    </Text>
                  </View>
                )}

                {bookingConflict && (
                  <View style={styles.conflictBanner}>
                    <View style={styles.conflictHeader}>
                      <AlertCircle size={20} color={COLORS.error} />
                      <Text style={styles.conflictTitle}>
                        {t('booking.conflict_title')}
                      </Text>
                    </View>
                    <Text style={styles.conflictText}>
                      {t('booking.conflict_msg', { start: bookingConflict.start, end: bookingConflict.end })}
                    </Text>
                    
                    {nextAvailableDate && (
                      <TouchableOpacity style={styles.smartBookBtn} onPress={handleSmartBook}>
                        <Text style={styles.smartBookBtnText}>
                          {t('booking.book_from_next', { date: nextAvailableDate })}
                        </Text>
                        <ArrowRight size={16} color={COLORS.white} style={{ marginLeft: 8 }} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.infoBox}>
                <Info size={16} color={COLORS.gray[500]} />
                <Text style={styles.infoText}>
                  {t('booking.insurance_info')}
                </Text>
              </View>

              <View style={[styles.infoBox, { backgroundColor: COLORS.success + '10', borderColor: COLORS.success + '30', borderWidth: 1 }]}>
                <Info size={16} color={COLORS.success} />
                <Text style={[styles.infoText, { color: COLORS.success, fontWeight: '600' }]}>
                  {t('booking.cash_payment_notice')}
                </Text>
              </View>

              <View style={styles.priceBreakdown}>
                <Text style={styles.sectionTitle}>{t('booking.price_details')}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{t('booking.daily_rate')} x {billingDays} {t('booking.days')}</Text>
                  <Text style={styles.priceValue}>{(parseFloat(car.price_per_day) * billingDays).toLocaleString()} {t('common.currency')}</Text>
                </View>
                <View style={[styles.priceRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>{t('booking.total_price')}</Text>
                  <Text style={styles.totalValue}>{totalPrice.toLocaleString()} {t('common.currency')}</Text>
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
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
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
  calendarWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    paddingBottom: SPACING.sm,
    width: '100%',
  },
  customCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  calendarMonthText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  conflictBanner: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.error + '10',
    padding: SPACING.md,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  conflictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  conflictTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.error,
    marginLeft: 8,
  },
  conflictText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.error,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  smartBookBtn: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: SIZES.radius.md,
  },
  smartBookBtnText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.white,
    fontWeight: '600',
  }
});

