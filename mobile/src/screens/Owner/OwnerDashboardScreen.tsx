import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { 
  Car, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ChevronLeft,
  DollarSign,
  User,
  Phone,
  Timer
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { toast } from '../../utils/toast';

type Tab = 'requests' | 'active' | 'history';

export default function OwnerDashboardScreen({ navigation }: any) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = React.useState<Tab>('requests');
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  // Double-action protection: track loading state per booking
  const [updatingStatus, setUpdatingStatus] = React.useState<Record<string, boolean>>({});

  const fetchBookings = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/bookings/owner');
      setBookings(response.data.data.bookings);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error(t('common.error_occurred'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(true);
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    // Double-action protection
    if (updatingStatus[bookingId]) return;
    
    setUpdatingStatus(prev => ({ ...prev, [bookingId]: true }));
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      toast.success(t(`status.${status}`));
      fetchBookings(true);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || t('common.error_occurred');
      toast.error(errorMsg);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const filteredBookings = React.useMemo(() => {
    if (activeTab === 'requests') {
      return bookings.filter(b => b.status === 'pending');
    }
    if (activeTab === 'active') {
      return bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress');
    }
    return bookings.filter(b => b.status === 'completed' || b.status === 'rejected' || b.status === 'cancelled');
  }, [bookings, activeTab]);

  const stats = React.useMemo(() => {
    const active = bookings.filter(b => b.status === 'in_progress').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const totalEarnings = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.total_price), 0);

    return { active, pending, confirmed, totalEarnings };
  }, [bookings]);

  const renderStatCard = (label: string, value: string | number, icon: any, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, { size: 20, color: color })}
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  // Calculate hours remaining for pending bookings (12h timeout)
  const getHoursRemaining = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const hoursElapsed = (now - created) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, 12 - hoursElapsed);
    return Math.ceil(hoursRemaining);
  };

  const renderBookingItem = ({ item }: { item: any }) => {
    const hoursRemaining = item.status === 'pending' ? getHoursRemaining(item.created_at) : 0;
    
    return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.carName}>{item.brand} {item.model}</Text>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={COLORS.gray[500]} />
            <Text style={styles.dateText}>
              {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {t(`status.${item.status}`)}
          </Text>
        </View>
      </View>

      {/* Pending Timeout Warning */}
      {item.status === 'pending' && hoursRemaining <= 12 && (
        <View style={styles.pendingWarning}>
          <Timer size={16} color={hoursRemaining <= 3 ? COLORS.error : COLORS.warning} />
          <Text style={[styles.pendingText, { color: hoursRemaining <= 3 ? COLORS.error : COLORS.warning }]}>
            {hoursRemaining > 0 
              ? `${t('owner.expires_in')} ${hoursRemaining} ${t('owner.hours')}`
              : t('owner.waiting_response')
            }
          </Text>
        </View>
      )}

      <View style={styles.renterSection}>
        <View style={styles.renterInfo}>
          <User size={16} color={COLORS.gray[600]} />
          <Text style={styles.renterName}>{item.renter_name}</Text>
        </View>
        <View style={styles.renterInfo}>
          <Phone size={16} color={COLORS.gray[600]} />
          <Text style={styles.renterPhone}>{item.renter_phone}</Text>
        </View>
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.totalLabel}>{t('booking.total_price')}</Text>
        <Text style={styles.totalValue}>{parseFloat(item.total_price).toLocaleString()} {t('common.currency')}</Text>
      </View>

      <View style={styles.actionSection}>
        {item.status === 'pending' && (
          <>
            {/* Auto expire note */}
            {hoursRemaining <= 3 && (
              <View style={styles.expireNote}>
                <Text style={styles.expireText}>{t('owner.auto_expire_note')}</Text>
              </View>
            )}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton, updatingStatus[item.id] && styles.disabledButton]} 
                onPress={() => handleUpdateStatus(item.id, 'rejected')}
                disabled={updatingStatus[item.id]}
              >
                <Text style={styles.rejectButtonText}>{t('booking.reject')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton, updatingStatus[item.id] && styles.disabledButton]} 
                onPress={() => handleUpdateStatus(item.id, 'confirmed')}
                disabled={updatingStatus[item.id]}
              >
                <Text style={styles.acceptButtonText}>{t('booking.accept')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        {item.status === 'confirmed' && (
          <Button 
            title={t('booking.start_trip')} 
            onPress={() => handleUpdateStatus(item.id, 'in_progress')}
            loading={updatingStatus[item.id]}
            disabled={updatingStatus[item.id]}
          />
        )}
        {item.status === 'in_progress' && (
          <Button 
            title={t('booking.complete_trip')} 
            onPress={() => handleUpdateStatus(item.id, 'completed')}
            variant="outline"
            loading={updatingStatus[item.id]}
            disabled={updatingStatus[item.id]}
          />
        )}
      </View>
    </View>
  );
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('owner.dashboard')}</Text>
        </View>
        {user?.car_count && user.car_count > 0 ? (
          <TouchableOpacity onPress={() => navigation.navigate('MyCars')}>
            <Text style={styles.manageCarsText}>{t('profile.my_cars')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {!user?.car_count || user.car_count === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon={Car}
            title={t('owner.dashboard_intro_title')}
            description={t('owner.dashboard_intro_desc')}
            actionLabel={t('owner.start_listing')}
            onAction={() => navigation.navigate('AddCar')}
          />
        </View>
      ) : (
        <>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.statsContainer}
            contentContainerStyle={styles.statsContent}
          >
            {renderStatCard(t('owner.stat_pending'), stats.pending, Clock, COLORS.warning)}
            {renderStatCard(t('owner.stat_active'), stats.active, Car, COLORS.primary)}
            {renderStatCard(t('owner.earnings'), stats.totalEarnings.toLocaleString(), DollarSign, COLORS.success)}
          </ScrollView>

          <View style={styles.tabContainer}>
            {(['requests', 'active', 'history'] as Tab[]).map((tab) => (
              <TouchableOpacity 
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {t(`owner.${tab}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredBookings}
            keyExtractor={(item) => item.id}
            renderItem={renderBookingItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
            ListEmptyComponent={
              <EmptyState
                icon={Calendar}
                title={t(`owner.empty_${activeTab}`)}
                description={activeTab === 'requests' ? "" : t('profile.no_bookings_desc')}
              />
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return COLORS.warning;
    case 'confirmed': return COLORS.success;
    case 'in_progress': return COLORS.primary;
    case 'completed': return COLORS.gray[600];
    case 'rejected':
    case 'cancelled': return COLORS.error;
    default: return COLORS.gray[400];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  manageCarsText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsContainer: {
    maxHeight: 100,
    marginTop: SPACING.sm,
  },
  statsContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  statCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    paddingRight: SPACING.lg,
    borderRadius: SIZES.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  tab: {
    paddingVertical: SPACING.sm,
    marginRight: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    ...SHADOWS.light,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  carName: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radius.xs,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  renterSection: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.sm,
    borderRadius: SIZES.radius.md,
    marginBottom: SPACING.md,
  },
  renterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  renterName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  renterPhone: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  totalLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  totalValue: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionSection: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: SIZES.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  rejectButtonText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  // NEW: Pending timeout styles
  pendingWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    padding: SPACING.sm,
    borderRadius: SIZES.radius.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  pendingText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
  },
  expireNote: {
    backgroundColor: COLORS.error + '10',
    padding: SPACING.sm,
    borderRadius: SIZES.radius.md,
    marginBottom: SPACING.sm,
    width: '100%',
  },
  expireText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
