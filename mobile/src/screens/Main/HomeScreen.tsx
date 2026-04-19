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
  const [selectedCity, setSelectedCity] = React.useState('All');
  const [hasError, setHasError] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [tempSearch, setTempSearch] = React.useState('');

  const fetchCars = React.useCallback(async (isRefresh = false) => {
    try {
      setHasError(false);
      if (!isRefresh) setLoading(true);
      
      let url = '/cars?available=true';
      if (selectedCity !== 'All') {
        url += `&location=${selectedCity}`;
      }
      if (searchQuery.trim().length > 0) {
        url += `&brand=${encodeURIComponent(searchQuery.trim())}`;
      }

      const response = await api.get(url);
      setCars(response.data.data.cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setHasError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCity, searchQuery]);

  React.useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const onRefresh = () => {
    setRefreshing(true);
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
          onSubmitEditing={() => setSearchQuery(tempSearch)}
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
          {CITIES.map((city) => (
            <TouchableOpacity 
              key={city}
              style={[
                styles.cityTab,
                selectedCity === city && styles.selectedTab
              ]}
              onPress={() => setSelectedCity(city)}
            >
              <Text 
                style={[
                  styles.cityText,
                  selectedCity === city && styles.selectedTabText
                ]}
              >
                {city === 'All' ? t('common.all') : city}
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
            title={t('common.error_occurred') || 'Oops!'}
            description={t('common.retry_message') || 'We could not load the cars. Please check your connection.'}
            actionLabel={t('common.retry') || 'Retry'}
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
            location={item.location}
            pricePerDay={parseFloat(item.price_per_day)}
            imageUrl={item.images?.[0]}
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
            title={t('home.empty') || 'No cars found'}
            description={t('home.empty_description') || 'Try changing the filters or check back later.'}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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

