import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Car,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  ShieldCheck,
  Star,
  Trash2,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import { toast } from '../../utils/toast';
import { formatDateLocal } from '../../utils/date';
import Button from '../../components/Button';

export default function BookingDetailScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { bookingId } = route.params;
  const [booking, setBooking] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [cancelling, setCancelling] = React.useState(false);
  // AbortController ref
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const fetchBooking = async (silent = false) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      if (!silent) setLoading(true);
      const response = await api.get(`/bookings/${bookingId}`, {
        signal: abortControllerRef.current.signal
      });
      setBooking(response.data.data.booking);
    } catch (error: any) {
      // Don't log CanceledError/AbortError - these are intentional
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Error fetching booking:', error);
        toast.error(t('common.error_occurred'));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial fetch
  React.useEffect(() => {
    fetchBooking();
    
    // Polling for pending/confirmed bookings to sync status
    const interval = setInterval(() => {
      if (booking?.status === 'pending' || booking?.status === 'confirmed') {
        fetchBooking(true); // Silent refresh
      }
    }, 30000); // 30 second poll
    
    // Cleanup: abort any pending requests on unmount
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [bookingId, booking?.status]);

  const handleCancel = () => {
    Alert.alert(
      t('booking.cancel'),
      t('booking.cancel_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('booking.cancel'),
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              const response = await api.patch(`/bookings/${bookingId}/status`, { status: 'cancelled' });
              if (response.data.status === 'success') {
                toast.success(t('common.success'));
                fetchBooking();
              }
            } catch (error: any) {
              const msg = error.response?.data?.message || t('common.error_occurred');
              toast.error(t('common.error'), msg);
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: COLORS.warning,
          bgColor: COLORS.warning + '15',
          icon: Timer,
          label: t('status.pending'),
          message: t('booking.waiting_owner'),
        };
      case 'confirmed':
        return {
          color: COLORS.success,
          bgColor: COLORS.success + '15',
          icon: CheckCircle2,
          label: t('status.confirmed'),
          message: t('booking.confirmed_by_owner'),
        };
      case 'in_progress':
        return {
          color: COLORS.primary,
          bgColor: COLORS.primary + '15',
          icon: Car,
          label: t('status.in_progress'),
          message: t('booking.trip_in_progress'),
        };
      case 'completed':
        return {
          color: COLORS.gray[600],
          bgColor: COLORS.gray[200],
          icon: CheckCircle2,
          label: t('status.completed'),
          message: t('booking.trip_completed'),
        };
      case 'cancelled':
        return {
          color: COLORS.error,
          bgColor: COLORS.error + '15',
          icon: XCircle,
          label: t('status.cancelled'),
          message: t('booking.cancelled_message'),
        };
      case 'rejected':
        return {
          color: COLORS.error,
          bgColor: COLORS.error + '15',
          icon: XCircle,
          label: t('status.rejected'),
          message: t('booking.rejected_by_owner'),
        };
      default:
        return {
          color: COLORS.gray[500],
          bgColor: COLORS.gray[100],
          icon: AlertCircle,
          label: status,
          message: '',
        };
    }
  };

  const canCancel = (status: string) => {
    return status === 'pending' || status === 'confirmed';
  };

  const isTopRatedOwner = (rating: number) => {
    return rating >= 4.5;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('booking.title')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('booking.title')}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('booking.not_found')}</Text>
          <Button title={t('common.go_home')} onPress={() => navigation.navigate('Home')} />
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;
  const showCancelButton = canCancel(booking.status);
  const ownerRating = parseFloat(booking.owner_rating) || 0;
  const ownerReviewCount = parseInt(booking.owner_review_count) || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('booking.title')}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusConfig.bgColor, borderColor: statusConfig.color + '30' }]}>
          <View style={[styles.statusIconContainer, { backgroundColor: statusConfig.color + '20' }]}>
            <StatusIcon size={28} color={statusConfig.color} />
          </View>
          <View style={styles.statusContent}>
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {statusConfig.label.toUpperCase()}
            </Text>
            {statusConfig.message && (
              <Text style={styles.statusMessage}>{statusConfig.message}</Text>
            )}
          </View>
        </View>

        {/* Car Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('car.details')}</Text>
          
          <TouchableOpacity 
            style={styles.carInfoRow}
            onPress={() => navigation.navigate('CarDetail', { carId: booking.car_id })}
          >
            {booking.car_image ? (
              <Image source={{ uri: booking.car_image }} style={styles.carImage} />
            ) : (
              <View style={styles.carImagePlaceholder}>
                <Car size={24} color={COLORS.gray[400]} />
              </View>
            )}
            <View style={styles.carInfo}>
              <Text style={styles.carName}>{booking.brand} {booking.model}</Text>
              <View style={styles.carMeta}>
                <MapPin size={14} color={COLORS.gray[500]} />
                <Text style={styles.carMetaText}>{booking.location || t('common.not_available')}</Text>
              </View>
            </View>
            <ChevronLeft size={20} color={COLORS.gray[400]} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>

        {/* Owner Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('booking.owner_info')}</Text>
          
          <View style={styles.ownerInfoRow}>
            <View style={styles.ownerAvatar}>
              <User size={24} color={COLORS.primary} />
            </View>
            <View style={styles.ownerInfo}>
              <View style={styles.ownerNameRow}>
                <Text style={styles.ownerName}>{booking.owner_name || t('common.user')}</Text>
                {booking.owner_verified && (
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={12} color={COLORS.success} />
                    <Text style={styles.verifiedText}>{t('profile.verified')}</Text>
                  </View>
                )}
              </View>
              
              {/* Owner Rating */}
              <View style={styles.ratingRow}>
                <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.ratingText}>
                  {ownerRating > 0 ? ownerRating.toFixed(1) : '0.0'}
                </Text>
                <Text style={styles.reviewCount}>
                  ({ownerReviewCount} {t('review.reviews_title').toLowerCase()})
                </Text>
              </View>
              
              {isTopRatedOwner(ownerRating) && (
                <View style={styles.topRatedBadge}>
                  <Star size={12} color={COLORS.white} fill={COLORS.white} />
                  <Text style={styles.topRatedText}>{t('owner.top_rated')}</Text>
                </View>
              )}
              
              <View style={styles.contactRow}>
                <Phone size={14} color={COLORS.gray[500]} />
                <Text style={styles.contactText}>{booking.owner_phone || t('common.not_available')}</Text>
              </View>
            </View>
          </View>
          
          {!booking.owner_verified && (
            <View style={styles.unverifiedWarning}>
              <AlertCircle size={16} color={COLORS.warning} />
              <Text style={styles.unverifiedText}>{t('booking.owner_not_verified_warning')}</Text>
            </View>
          )}
        </View>

        {/* Dates Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('booking.dates')}</Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateIconContainer}>
              <Calendar size={20} color={COLORS.primary} />
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>{t('booking.start_date')}</Text>
              <Text style={styles.dateValue}>{formatDateLocal(booking.start_date)}</Text>
            </View>
          </View>
          
          <View style={styles.dateDivider}>
            <View style={styles.dividerLine} />
            <Clock size={16} color={COLORS.gray[400]} />
            <View style={styles.dividerLine} />
          </View>
          
          <View style={styles.dateRow}>
            <View style={styles.dateIconContainer}>
              <Calendar size={20} color={COLORS.primary} />
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>{t('booking.end_date')}</Text>
              <Text style={styles.dateValue}>{formatDateLocal(booking.end_date)}</Text>
            </View>
          </View>
        </View>

        {/* Price Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('booking.price_details')}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t('booking.daily_rate')}</Text>
            <Text style={styles.priceValue}>
              {parseFloat(booking.price_per_day || 0).toLocaleString()} {t('common.currency')}
            </Text>
          </View>
          
          <View style={styles.priceDivider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('booking.total_price')}</Text>
            <Text style={styles.totalValue}>
              {parseFloat(booking.total_price).toLocaleString()} {t('common.currency')}
            </Text>
          </View>
        </View>

        {/* Waiting for Owner Message */}
        {booking.status === 'pending' && (
          <View style={styles.waitingCard}>
            <Timer size={24} color={COLORS.warning} />
            <View style={styles.waitingContent}>
              <Text style={styles.waitingTitle}>{t('booking.waiting_owner_title')}</Text>
              <Text style={styles.waitingMessage}>{t('booking.waiting_owner_message')}</Text>
              <Text style={styles.waitingNote}>{t('booking.auto_cancel_note')}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {showCancelButton && (
            <Button
              title={t('booking.cancel')}
              onPress={handleCancel}
              loading={cancelling}
              variant="outline"
              style={styles.cancelButton}
              textStyle={{ color: COLORS.error }}
            />
          )}
          
          {booking.status === 'completed' && !booking.has_review && (
            <Button
              title={t('review.title')}
              onPress={() => navigation.navigate('Review', { bookingId: booking.id, carId: booking.car_id })}
              style={styles.reviewButton}
            />
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.error,
    marginBottom: SPACING.lg,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    ...SHADOWS.light,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    ...TYPOGRAPHY.h3,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    ...SHADOWS.light,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  carInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carImage: {
    width: 80,
    height: 60,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.gray[100],
  },
  carImagePlaceholder: {
    width: 80,
    height: 60,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  carInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  carName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  carMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carMetaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  ownerInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  ownerName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginRight: SPACING.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
    fontSize: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  reviewCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  topRatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 6,
  },
  topRatedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginLeft: 6,
  },
  unverifiedWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    padding: SPACING.md,
    borderRadius: SIZES.radius.md,
    marginTop: SPACING.md,
    gap: 8,
  },
  unverifiedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInfo: {
    marginLeft: SPACING.md,
  },
  dateLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  dateValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
    paddingLeft: 22,
  },
  dividerLine: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  priceLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  priceValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginVertical: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  totalValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: '800',
  },
  waitingCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '10',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
    gap: SPACING.md,
  },
  waitingContent: {
    flex: 1,
  },
  waitingTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.warning,
    marginBottom: 4,
  },
  waitingMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  waitingNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
    fontStyle: 'italic',
  },
  actionsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },
  cancelButton: {
    borderColor: COLORS.error,
  },
  reviewButton: {
    backgroundColor: COLORS.primary,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
