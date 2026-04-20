import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Calendar as CalendarIcon,
  ChevronLeft,
  Car
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import EmptyState from '../../components/EmptyState';
import { toast } from '../../utils/toast';
import CONFIG from '../../constants/config';

export default function MyCarsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [cars, setCars] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchCars = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/cars/my');
      setCars(response.data.data.cars);
    } catch (error) {
      console.error('Error fetching my cars:', error);
      toast.error(t('common.error_occurred'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  React.useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCars(true);
  };

  const handleDelete = (carId: string) => {
    Alert.alert(
      t('common.confirm'),
      t('common.confirm_delete_msg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/cars/${carId}`);
              toast.success(t('common.success'));
              fetchCars(true);
            } catch (error) {
              toast.error(t('common.error_occurred'));
            }
          }
        }
      ]
    );
  };

  const renderCarItem = ({ item }: { item: any }) => {
    const baseUrl = CONFIG.API_URL.replace('/api/v1', '');
    const imageUrl = item.image_url 
      ? (item.image_url.startsWith('http') ? item.image_url : `${baseUrl}/${item.image_url.replace(/^\//, '')}`)
      : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=500';

    return (
      <View style={styles.carCard}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.carImage} 
        />
        <View style={styles.carInfo}>
          <View style={styles.carHeaderText}>
            <Text style={styles.carName}>{item.brand} {item.model}</Text>
            <View style={[styles.availabilityBadge, { backgroundColor: item.is_available ? COLORS.success + '15' : COLORS.error + '15' }]}>
              <Text style={[styles.availabilityText, { color: item.is_available ? COLORS.success : COLORS.error }]}>
                {item.is_available ? t('status.confirmed') : t('car.not_available')}
              </Text>
            </View>
          </View>
          
          <View style={styles.specRow}>
            <View style={styles.specItem}>
              <MapPin size={14} color={COLORS.gray[500]} />
              <Text style={styles.specText}>{item.location}</Text>
            </View>
            <View style={styles.specItem}>
              <CalendarIcon size={14} color={COLORS.gray[500]} />
              <Text style={styles.specText}>{item.year}</Text>
            </View>
          </View>

          <Text style={styles.priceText}>
            {parseFloat(item.price_per_day).toLocaleString()} {t('common.currency')} <Text style={styles.priceLabel}>{t('car.per_day')}</Text>
          </Text>

          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={[styles.iconButton, styles.editButton]}
              onPress={() => navigation.navigate('EditCar', { carId: item.id })}
            >
              <Edit2 size={18} color={COLORS.primary} />
              <Text style={styles.editButtonText}>{t('common.edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, styles.deleteButton]}
              onPress={() => handleDelete(item.id)}
            >
              <Trash2 size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('profile.my_cars')}</Text>
          <Text style={styles.headerSubtitle}>{t('common.total_cars', { count: cars.length })}</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCar')}
        >
          <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={renderCarItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={Car}
            title={t('owner.no_cars')}
            description={t('owner.add_first_car')}
            actionLabel={t('owner.add_car_title')}
            onAction={() => navigation.navigate('AddCar')}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  backButton: {
    marginRight: SPACING.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  carCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    ...SHADOWS.light,
  },
  carImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.gray[200],
  },
  carInfo: {
    padding: SPACING.md,
  },
  carHeaderText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  carName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radius.xs,
  },
  availabilityText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  specRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  priceText: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  priceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '400',
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[50],
    paddingTop: SPACING.md,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: SIZES.radius.md,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  editButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    width: 40,
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
});
