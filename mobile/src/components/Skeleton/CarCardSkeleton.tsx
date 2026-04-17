import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { SPACING, SIZES, COLORS } from '../../constants/theme';

/**
 * CarCardSkeleton Component
 * Placeholder for the CarCard during loading states.
 */
const CarCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Image Placeholder */}
      <Skeleton width="100%" height={180} borderRadius={SIZES.radius.md} />
      
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.leftCol}>
            {/* Brand/Model */}
            <Skeleton width="60%" height={24} style={{ marginBottom: 4 }} />
            {/* Year/Location */}
            <Skeleton width="40%" height={16} />
          </View>
          {/* Price */}
          <Skeleton width="25%" height={28} />
        </View>

        <View style={styles.footer}>
          {/* Location Badge */}
          <Skeleton width="35%" height={20} borderRadius={SIZES.radius.sm} />
          {/* Action Button Label */}
          <Skeleton width="15%" height={20} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  content: {
    padding: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  leftCol: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[50],
  },
});

export default CarCardSkeleton;
