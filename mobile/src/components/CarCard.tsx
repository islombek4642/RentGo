import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { COLORS, SPACING, SIZES, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { Users, Fuel, MapPin, ShieldCheck, Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import CONFIG from '../constants/config';

interface CarCardProps {
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: string;
  imageUrl?: string;
  onPress?: () => void;
  // NEW: Owner info
  ownerName?: string;
  ownerVerified?: boolean;
  ownerRating?: number;
  ownerReviewCount?: number;
}

const CarCard: React.FC<CarCardProps> = ({
  brand,
  model,
  year,
  pricePerDay,
  location,
  imageUrl,
  onPress,
  ownerName,
  ownerVerified,
  ownerRating,
  ownerReviewCount
}) => {
  const { t } = useTranslation();

  const getFullImageUrl = (url?: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800';
    if (url.startsWith('http')) return url;
    
    // Remove /api/v1 from end of URL and handle potential leading slashes
    const baseUrl = CONFIG.API_URL.replace(/\/api\/v1\/?$/, '');
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${baseUrl}/${cleanPath}`;
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      style={styles.container} 
      onPress={onPress}
    >
      <Image 
        source={{ uri: getFullImageUrl(imageUrl) }} 
        style={styles.image} 
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{brand} {model}</Text>
          <Text style={styles.year}>{year}</Text>
        </View>

        {/* Owner Info */}
        {(ownerName || ownerVerified || ownerRating) && (
          <View style={styles.ownerRow}>
            <View style={styles.ownerInfo}>
              {ownerVerified && (
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={12} color={COLORS.success} />
                  <Text style={styles.verifiedText}>{t('profile.verified')}</Text>
                </View>
              )}
              {(ownerRating && ownerRating > 0) && (
                <View style={styles.ratingBadge}>
                  <Star size={12} color={COLORS.warning} fill={COLORS.warning} />
                  <Text style={styles.ratingText}>{ownerRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MapPin size={14} color={COLORS.gray[500]} />
            <Text style={styles.detailText}>{location}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{pricePerDay.toLocaleString()} {t('common.currency')}</Text>
            <Text style={styles.perDay}>{t('car.per_day')}</Text>
          </View>
          <TouchableOpacity style={styles.bookButton} onPress={onPress}>
            <Text style={styles.bookButtonText}>{t('car.view')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.gray[100],
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  year: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  details: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[600],
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  perDay: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
    marginLeft: 2,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius.sm,
  },
  bookButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    fontSize: 14,
  },
  // NEW: Owner info styles
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  verifiedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
    fontSize: 9,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  ratingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    fontWeight: '700',
    fontSize: 10,
  },
});

export default CarCard;
