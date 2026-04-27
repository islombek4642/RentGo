import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY, SIZES } from '../../constants/theme';
import api from '../../services/api';
import CarCard from '../../components/CarCard';
import CarCardSkeleton from '../../components/Skeleton/CarCardSkeleton';
import EmptyState from '../../components/EmptyState';
import { Car, AlertCircle, Search, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

const CITIES = ['All', 'Tashkent', 'Samarkand', 'Bukhara'];

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [cars, setCars] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [regions, setRegions] = React.useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = React.useState<number | 'All'>('All');
  // NEW: Car type filter
  const [selectedCarType, setSelectedCarType] = React.useState<string>('all');
  const [hasError, setHasError] = React.useState(false);
  // AbortController ref for cancelling requests on unmount
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [tempSearch, setTempSearch] = React.useState('');

  const isMounted = React.useRef(true);

  const fetchCars = React.useCallback(async (isRefresh = false, silent = false) => {
    try {
      setHasError(false);
      if (!isRefresh && !silent) setLoading(true);
      
      const params: any = { available: true };
      if (selectedRegionId !== 'All') {
        params.region_id = selectedRegionId;
      }
      if (searchQuery.trim().length > 0) {
        params.search = searchQuery.trim();
      }
      if (selectedCarType !== 'all') {
        params.car_type = selectedCarType;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      const response = await api.get('/cars', {
        params,
        signal: abortControllerRef.current.signal
      });
      
      if (isMounted.current) {
        setCars(response.data.data.cars);
      }
    } catch (error: any) {
      if (isMounted.current && error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Error fetching cars:', error);
        setHasError(true);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [selectedRegionId, searchQuery, selectedCarType]);

  // Initial load only - filters are handled separately
  React.useEffect(() => {
    isMounted.current = true;
    fetchRegions();
    fetchCars(false, true);
    
    // Cleanup: abort any pending requests on unmount
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await api.get('/locations/regions');
      if (isMounted.current) {
        setRegions(response.data.data.regions);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Failed to fetch regions:', error);
      }
    }
  };

  const getLocalizedName = (item: any) => {
    const lang = t('common.lang_code') || 'uz';
    const l = lang === 'ru' ? 'ru' : (lang === 'oz' ? 'oz' : 'uz');
    return item[`name_${l}`] || item.name_uz;
  };

  // Handle search debouncing
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(tempSearch);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [tempSearch]);

  // Handle filter changes silently (without full screen reload)
  React.useEffect(() => {
    // Skip initial render, only update when filters actually change
    fetchCars(false, true);
  }, [selectedRegionId, searchQuery, selectedCarType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegions();
    fetchCars(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{t('home.greeting')}</Text>
          <Text style={styles.title}>{t('home.title')}</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { marginBottom: SPACING.md }]}>
        <Search size={20} color={COLORS.gray[400]} />
        <TextInput 
          style={styles.searchInput}
          placeholder={t('home.search')}
          value={tempSearch}
          onChangeText={setTempSearch}
          returnKeyType="search"
        />
        {tempSearch.length > 0 && (
          <TouchableOpacity onPress={() => {
            setTempSearch('');
            setSearchQuery('');
          }}>
            <X size={20} color={COLORS.gray[800]} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[
              styles.cityTab,
              selectedRegionId === 'All' && styles.selectedTab
            ]}
            onPress={() => setSelectedRegionId('All')}
          >
            <Text 
              style={[
                styles.cityText,
                selectedRegionId === 'All' && styles.selectedTabText
              ]}
            >
              {t('common.all')}
            </Text>
          </TouchableOpacity>

          {regions.map((region) => (
            <TouchableOpacity 
              key={region.id}
              style={[
                styles.cityTab,
                selectedRegionId === region.id && styles.selectedTab
              ]}
              onPress={() => setSelectedRegionId(region.id)}
            >
              <Text 
                style={[
                  styles.cityText,
                  selectedRegionId === region.id && styles.selectedTabText
                ]}
              >
                {getLocalizedName(region)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* NEW: Car Type Filter */}
      <View style={[styles.filterContainer, { marginTop: SPACING.sm }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[
              styles.typeTab,
              selectedCarType === 'all' && styles.selectedTypeTab
            ]}
            onPress={() => setSelectedCarType('all')}
          >
            <Text 
              style={[
                styles.typeText,
                selectedCarType === 'all' && styles.selectedTypeText
              ]}
            >
              {t('filters.all_types')}
            </Text>
          </TouchableOpacity>
          
          {['economy', 'standard', 'suv', 'luxury'].map((type) => (
            <TouchableOpacity 
              key={type}
              style={[
                styles.typeTab,
                selectedCarType === type && styles.selectedTypeTab
              ]}
              onPress={() => setSelectedCarType(type)}
            >
              <Text 
                style={[
                  styles.typeText,
                  selectedCarType === type && styles.selectedTypeText
                ]}
              >
                {t(`filters.${type}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => <CarCardSkeleton key={i} />)}
        </View>
      );
    }

    if (hasError) {
      return (
        <View style={{ flex: 1 }}>
          <EmptyState
            icon={AlertCircle}
            title={t('common.error_occurred')}
            description={t('common.retry_message')}
            actionLabel={t('common.retry')}
            onAction={() => fetchCars()}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CarCard
            brand={item.brand}
            model={item.model}
            year={item.year}
            location={item.display_location || item.location}
            pricePerDay={parseFloat(item.price_per_day)}
            imageUrl={item.image_url}
            onPress={() => navigation.navigate('CarDetail', { carId: item.id })}
          />
        )}
        ListHeaderComponent={renderHeader()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={Car}
            title={t('home.empty')}
            description={t('home.empty_description')}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.radius.full,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  greeting: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    marginTop: SPACING.sm,
  },
  cityTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  selectedTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  selectedTabText: {
    color: COLORS.white,
  },
  // NEW: Car type filter styles
  typeTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  selectedTypeTab: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  typeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  selectedTypeText: {
    color: COLORS.white,
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.gray[500],
  },
});

