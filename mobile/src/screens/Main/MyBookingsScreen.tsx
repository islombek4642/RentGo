import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import Skeleton from '../../components/Skeleton/Skeleton';
import EmptyState from '../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, AlertCircle, ChevronRight } from 'lucide-react-native';

export default function MyBookingsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const fetchBookings = React.useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);
      
      setHasError(false);
      const response = await api.get('/bookings/my');
      setBookings(response.data.data.bookings);
    } catch (error) {
      console.error('Error fetching my bookings:', error);
      setHasError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed': 
        return { color: COLORS.success, label: t('status.confirmed') };
      case 'pending': 
        return { color: COLORS.warning, label: t('status.pending') };
      case 'cancelled': 
        return { color: COLORS.error, label: t('status.cancelled') };
      default: 
        return { color: COLORS.gray[500], label: status };
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => {
    const status = getStatusConfig(item.status);
    // Data Safety: Fallback for missing brand/model
    const carName = item.brand && item.model ? `${item.brand} ${item.model}` : t('car.not_available') || 'Car data unavailable';

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString();
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

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.priceLabel}>{t('booking.total_price')}</Text>
            <Text style={styles.priceValue}>${parseFloat(item.total_price).toLocaleString()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => navigation.navigate('CarDetail', { carId: item.car_id, isReadOnly: true })}
          >
            <Text style={styles.detailsText}>{t('common.details') || 'Details'}</Text>
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
    <SafeAreaView style={styles.container}>
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
              description={t('profile.no_bookings_desc') || 'Your rental history will appear here.'}
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
    marginBottom: SPACING.lg,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  detailsText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
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

