import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect as useNavigationFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import Skeleton from '../../components/Skeleton/Skeleton';
import EmptyState from '../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, AlertCircle, ChevronRight, Trash2, Star, CheckCircle2 } from 'lucide-react-native';
import { toast } from '../../utils/toast';
import { formatDateLocal } from '../../utils/date';

export default function MyBookingsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  // Double-action protection for cancel
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  // AbortController ref
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const fetchBookings = React.useCallback(async (isRefreshing = false) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);
      
      setHasError(false);
      const response = await api.get('/bookings/my', {
        signal: abortControllerRef.current.signal
      });
      setBookings(response.data.data.bookings);
    } catch (error: any) {
      // Don't log CanceledError/AbortError - these are intentional
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Error fetching my bookings:', error);
        setHasError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Automatically refresh when the screen comes into focus
  useNavigationFocusEffect(
    React.useCallback(() => {
      fetchBookings(true);
      
      // Cleanup: abort any pending requests on blur
      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, [fetchBookings])
  );

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      t('booking.cancel'),
      t('booking.cancel_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('booking.cancel'), 
          style: 'destructive',
          onPress: async () => {
            // Double-action protection
            if (cancellingId === bookingId) return;
            setCancellingId(bookingId);
            try {
              const response = await api.patch(`/bookings/${bookingId}/status`, { status: 'cancelled' });
              if (response.data.status === 'success') {
                toast.success(t('common.success'));
                fetchBookings(true);
              }
            } catch (error: any) {
              const msg = error.response?.data?.message || t('common.error_occurred');
              toast.error(t('common.error'), msg);
            }
          }
        }
      ]
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed': 
        return { color: COLORS.success, label: t('status.confirmed') };
      case 'pending': 
        return { color: COLORS.warning, label: t('status.pending') };
      case 'cancelled': 
        return { color: COLORS.error, label: t('status.cancelled') };
      case 'completed':
        return { color: COLORS.gray[600], label: t('status.completed') };
      case 'in_progress':
        return { color: COLORS.primary, label: t('status.in_progress') };
      default: 
        return { color: COLORS.gray[500], label: status };
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => {
    const status = getStatusConfig(item.status);
    const carName = item.brand && item.model ? `${item.brand} ${item.model}` : t('car.not_available');

    const formatDate = (dateStr: string) => {
      return formatDateLocal(dateStr);
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: SPACING.md }}>
            <Text style={styles.carName} numberOfLines={1}>{carName}</Text>
            <View style={styles.dateRow}>
              <Clock size={14} color={COLORS.gray[500]} />
              <Text style={styles.dateText}>{formatDate(item.start_date)} → {formatDate(item.end_date)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.priceSection}>
           <Text style={styles.priceLabel}>{t('booking.total_price')}</Text>
           <Text style={styles.priceValue}>{parseFloat(item.total_price).toLocaleString()} {t('common.currency')}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.actionsRow}>
            {(item.status === 'pending' || item.status === 'confirmed') && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancel(item.id)}
              >
                <Trash2 size={16} color={COLORS.error} />
              </TouchableOpacity>
            )}

            {item.status === 'completed' && !item.has_review && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.reviewButton]}
                onPress={() => navigation.navigate('Review', { bookingId: item.id, carId: item.car_id })}
              >
                <Star size={14} color={COLORS.white} fill={COLORS.white} />
                <Text style={styles.reviewButtonText}>{t('review.submit')}</Text>
              </TouchableOpacity>
            )}

            {item.status === 'completed' && item.has_review && (
              <View style={styles.reviewedBadge}>
                <CheckCircle2 size={14} color={COLORS.success} />
                <Text style={styles.reviewedText}>{t('review.success')}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
          >
            <Text style={styles.detailsText}>{t('common.details')}</Text>
            <ChevronRight size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('nav.bookings')}</Text>
        </View>
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <Skeleton width="60%" height={20} style={{ marginBottom: 10 }} />
              <Skeleton width="40%" height={14} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('nav.bookings')}</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchBookings(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListEmptyComponent={
          hasError ? (
            <EmptyState
              icon={AlertCircle}
              title={t('common.error')}
              description={t('common.retry_message')}
              actionLabel={t('common.retry')}
              onAction={() => fetchBookings()}
            />
          ) : (
            <EmptyState
              icon={Calendar}
              title={t('profile.no_bookings')}
              description={t('profile.no_bookings_desc')}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

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
  listContent: {
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  carName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  priceSection: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[50],
  },
  priceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
  },
  priceValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailsText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionButton: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cancelButton: {
    backgroundColor: COLORS.error + '10',
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
  reviewButton: {
    backgroundColor: COLORS.primary,
  },
  reviewButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 11,
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reviewedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
    fontSize: 11,
  },
  skeletonCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: SIZES.radius.lg,
    marginBottom: SPACING.md,
    height: 120,
    opacity: 0.6,
  }
});
