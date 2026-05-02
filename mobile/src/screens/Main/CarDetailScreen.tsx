import * as React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import CONFIG from '../../constants/config';
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
  AlertCircle,
  Star,
  User,
  CheckCircle2
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
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>({ average: 0, count: 0 });

  React.useEffect(() => {
    if (!carId) {
      toast.error(t('common.error'), t('car.not_found'));
      navigation.goBack();
      return;
    }

    const fetchCarDetail = async () => {
      try {
        setLoading(true);
        const [carRes, reviewsRes] = await Promise.all([
          api.get(`/cars/${carId}`),
          api.get(`/reviews/car/${carId}`)
        ]);
        
        setCar(carRes.data.data.car);
        setReviews(reviewsRes.data.data.reviews);
        setStats(reviewsRes.data.data.stats);
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
      <ScrollView 
        bounces={false} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isReadOnly ? insets.bottom + 20 : insets.bottom + 100 }}
      >
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ 
              uri: car.image_url 
                ? (car.image_url.startsWith('http') 
                  ? car.image_url 
                  : `${CONFIG.API_URL.replace(/\/api\/v1\/?$/, '')}/${car.image_url.replace(/^\//, '')}`)
                : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800'
            }} 
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
            <View style={{ flex: 1 }}>
              {car.car_type && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {t(`filters.${car.car_type.toLowerCase()}`, { defaultValue: car.car_type })}
                  </Text>
                </View>
              )}
              <Text style={styles.brand}>{car.brand}</Text>
              <Text style={styles.title}>{car.model}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{parseFloat(car.price_per_day).toLocaleString()} {t('common.currency')}</Text>
              <Text style={styles.perDay}>{t('car.per_day')}</Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.starsWrapper}>
              <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
              <Text style={styles.ratingText}>
                {stats.average || '0.0'} 
                <Text style={styles.reviewCountText}> ({stats.count} {t('review.reviews_title')})</Text>
              </Text>
            </View>
            <View style={styles.locationContainer}>
              <MapPin size={16} color={COLORS.gray[500]} />
              <Text style={styles.locationText}>
                {(() => {
                  const loc = (car.location || '').trim();
                  if (!loc) return t('common.not_available');
                  const translated = t(`regions.${loc.toLowerCase()}`);
                  return translated.startsWith('regions.') ? loc : translated;
                })()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Owner Info Section */}
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>{t('car.owner_title')}</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerHeader}>
                <View style={styles.ownerAvatar}>
                  <User size={24} color={COLORS.primary} />
                </View>
                <View style={styles.ownerInfo}>
                  <View style={styles.ownerNameRow}>
                    <Text style={styles.ownerName}>{car.owner_name || t('common.user')}</Text>
                    {car.owner_verified && (
                      <View style={styles.verifiedBadge}>
                        <CheckCircle2 size={12} color={COLORS.success} />
                        <Text style={styles.verifiedText}>{t('profile.verified')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.ownerRatingRow}>
                    <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                    <Text style={styles.ownerRatingText}>
                      {parseFloat(car.owner_rating || 0).toFixed(1)}
                    </Text>
                    <Text style={styles.ownerReviewCount}>
                      ({car.owner_review_count || 0} {t('review.reviews_title')})
                    </Text>
                  </View>
                </View>
              </View>
              
              {parseFloat(car.owner_rating || 0) >= 4.5 && (
                <View style={styles.topRatedBadge}>
                  <Star size={14} color={COLORS.white} fill={COLORS.white} />
                  <Text style={styles.topRatedText}>{t('owner.top_rated')}</Text>
                </View>
              )}
              
              {!car.owner_verified && (
                <View style={styles.unverifiedWarning}>
                  <AlertCircle size={16} color={COLORS.warning} />
                  <Text style={styles.unverifiedText}>{t('car.owner_not_verified')}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Specs Section */}
          <Text style={styles.sectionTitle}>{t('car.specifications')}</Text>
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <View style={styles.iconBox}>
                <Users size={20} color={COLORS.primary} />
              </View>
              <View style={styles.specInfo}>
                <Text style={styles.specLabel}>{t('car.seats')}</Text>
                <Text style={styles.specValue}>{car.seats || 5} {t('car.units.items')}</Text>
              </View>
            </View>
            <View style={styles.specItem}>
              <View style={styles.iconBox}>
                <Fuel size={20} color={COLORS.primary} />
              </View>
              <View style={styles.specInfo}>
                <Text style={styles.specLabel}>{t('car.fuel')}</Text>
                <Text style={styles.specValue}>{t(`car.fuel_${car.fuel_type?.toLowerCase() || 'petrol'}`)}</Text>
              </View>
            </View>
            <View style={styles.specItem}>
              <View style={styles.iconBox}>
                <Settings size={20} color={COLORS.primary} />
              </View>
              <View style={styles.specInfo}>
                <Text style={styles.specLabel}>{t('car.transmission')}</Text>
                <Text style={styles.specValue}>
                  {car.transmission?.toLowerCase() === 'manual' 
                    ? t('car.transmission_manual') 
                    : t('car.transmission_automatic')}
                </Text>
              </View>
            </View>
            <View style={styles.specItem}>
              <View style={styles.iconBox}>
                <Calendar size={20} color={COLORS.primary} />
              </View>
              <View style={styles.specInfo}>
                <Text style={styles.specLabel}>{t('car.year')}</Text>
                <Text style={styles.specValue}>{car.year} {t('car.units.year')}</Text>
              </View>
            </View>
          </View>

          {/* Features Section */}
          <Text style={styles.sectionTitle}>{t('car.features')}</Text>
          <View style={styles.features}>
            {/* Dynamic features from car data */}
            {car.features && Array.isArray(car.features) && car.features.length > 0 ? (
              car.features.map((feature: string, index: number) => (
                <View key={index} style={styles.featureItem}>
                  <ShieldCheck size={18} color={COLORS.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))
            ) : (
              // Default features if none provided
              <>
                <View style={styles.featureItem}>
                  <ShieldCheck size={18} color={COLORS.success} />
                  <Text style={styles.featureText}>{t('car.insurance')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <Calendar size={18} color={COLORS.success} />
                  <Text style={styles.featureText}>{t('car.instant')}</Text>
                </View>
              </>
            )}
          </View>

          <Text style={styles.sectionTitle}>{t('car.description_title')}</Text>
          <Text style={styles.description}>
            {car.description || t('car.description_template', { 
              brand: car.brand, 
              model: car.model, 
              location: car.location 
             })}
          </Text>
          
          <View style={styles.divider} />
          
          {/* Reviews Section */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>{t('review.reviews_title')}</Text>
            {stats.count > 0 && <Text style={styles.avgRatingLarge}>{stats.average}</Text>}
          </View>

          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewItem}>
                <View style={styles.reviewUserRow}>
                  <Text style={styles.reviewerName}>{rev.reviewer_name}</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={12} 
                        color={rev.rating >= s ? COLORS.warning : COLORS.gray[200]} 
                        fill={rev.rating >= s ? COLORS.warning : 'transparent'} 
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{new Date(rev.created_at).toLocaleDateString()}</Text>
                {rev.comment && <Text style={styles.reviewComment}>{rev.comment}</Text>}
              </View>
            ))
          ) : (
            <Text style={styles.noReviewsText}>{t('review.no_reviews')}</Text>
          )}
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
    marginTop: 4,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  categoryBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
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
  locationText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  starsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  reviewCountText: {
    fontWeight: '400',
    color: COLORS.gray[500],
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  specItem: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specInfo: {
    flex: 1,
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
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avgRatingLarge: {
    ...TYPOGRAPHY.h2,
    color: COLORS.warning,
  },
  reviewItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  reviewUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[400],
    marginBottom: SPACING.xs,
  },
  reviewComment: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  noReviewsText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[400],
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  ownerSection: {
    marginBottom: SPACING.md,
  },
  ownerCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.radius.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  ownerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerRatingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  ownerReviewCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  topRatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: SPACING.sm,
  },
  topRatedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 11,
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

