import * as React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton/Skeleton';
import { toast } from '../../utils/toast';
import { 
  ChevronLeft, 
  Users, 
  Fuel, 
  Settings, 
  MapPin, 
  Calendar,
  ShieldCheck,
  AlertCircle 
} from 'lucide-react-native';

import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'CarDetail'>;

export default function CarDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const carId = route?.params?.carId;
  const isReadOnly = route?.params?.isReadOnly;
  const insets = useSafeAreaInsets();
  
  const [car, setCar] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!carId) {
      toast.error(t('common.error'), t('car.not_found'));
      navigation.goBack();
      return;
    }

    const fetchCarDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/cars/${carId}`);
        setCar(response.data.data.car);
      } catch (error) {
        console.error('Error fetching car details:', error);
        toast.error(t('common.error'), t('car.not_found'));
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetail();
  }, [carId, navigation, t]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Skeleton width="100%" height={350} />
        <View style={styles.content}>
          <Skeleton width="40%" height={24} style={{ marginBottom: 10 }} />
          <Skeleton width="70%" height={32} style={{ marginBottom: 20 }} />
          <View style={styles.specsGrid}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width={(width - 64) / 3} height={80} borderRadius={12} />
            ))}
          </View>
          <Skeleton width="100%" height={100} borderRadius={12} />
        </View>
      </View>
    );
  }

  if (!car) return null;

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: car.images?.[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800' }} 
            style={styles.image} 
          />
          <TouchableOpacity 
            style={[styles.backButton, { top: Math.max(insets.top + 10, 50) }]}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>{car.brand}</Text>
              <Text style={styles.title}>{car.model}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${parseFloat(car.price_per_day).toLocaleString()}</Text>
              <Text style={styles.perDay}>{t('car.per_day')}</Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <MapPin size={16} color={COLORS.gray[500]} />
            <Text style={styles.locationText}>{car.location}</Text>
          </View>

          <View style={styles.divider} />

          {/* Specs Section */}
          <Text style={styles.sectionTitle}>{t('car.specifications')}</Text>
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <View style={styles.iconBox}>
                <Users size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.specLabel}>{t('car.seats')}</Text>
              <Text style={styles.specValue}>5 {t('car.seats')}</Text>
            </View>
            <View style={styles.specItem}>
              <View style={styles.iconBox}>
                <Fuel size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.specLabel}>{t('car.fuel')}</Text>
              <Text style={styles.specValue}>Electric</Text>
            </View>
            <View style={styles.specItem}>
              <View style={styles.iconBox}>
                <Settings size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.specLabel}>{t('car.year')}</Text>
              <Text style={styles.specValue}>{car.year}</Text>
            </View>
          </View>

          {/* Features Section */}
          <Text style={styles.sectionTitle}>{t('car.features')}</Text>
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <ShieldCheck size={18} color={COLORS.success} />
              <Text style={styles.featureText}>{t('car.insurance')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Calendar size={18} color={COLORS.success} />
              <Text style={styles.featureText}>{t('car.instant')}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{t('car.description_title')}</Text>
          <Text style={styles.description}>
            {t('car.description_template', { 
              brand: car.brand, 
              model: car.model, 
              location: car.location 
            })}
          </Text>
          
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      {!isReadOnly && (
        <SafeAreaView style={styles.footer} edges={['bottom']}>
          <Button 
            title={t('car.book_now')} 
            onPress={() => navigation.navigate('BookingConfirm', { carId: car.id, startDate: '', endDate: '' })} 
          />
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    height: 350,
    width: width,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  brand: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  perDay: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  specItem: {
    width: (width - 64) / 3,
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  specLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[400],
    marginBottom: 2,
  },
  specValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  features: {
    marginBottom: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    marginLeft: 10,
  },
  description: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    ...SHADOWS.medium,
  },
});

