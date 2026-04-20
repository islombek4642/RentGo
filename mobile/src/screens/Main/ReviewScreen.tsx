import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import { Star, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { toast } from '../../utils/toast';
import Button from '../../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

export default function ReviewScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { bookingId, carId } = route.params;
  
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t('common.error'), t('review.subtitle'));
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/reviews', {
        booking_id: bookingId,
        rating,
        comment
      });

      if (response.data.status === 'success') {
        toast.success(t('review.success'));
        navigation.goBack();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || t('common.error_occurred');
      toast.error(t('common.error'), msg);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => setRating(star)}
            activeOpacity={0.7}
          >
            <Star 
              size={40} 
              color={rating >= star ? COLORS.primary : COLORS.gray[300]} 
              fill={rating >= star ? COLORS.primary : 'transparent'} 
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Fixed Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('review.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.subtitle}>{t('review.subtitle')}</Text>
            
            {renderStars()}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('review.rating_label')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('review.comment_placeholder')}
                placeholderTextColor={COLORS.gray[400]}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={comment}
                onChangeText={setComment}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button 
              title={t('review.submit')} 
              onPress={handleSubmit} 
              loading={loading}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 4,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  content: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.xxl,
  },
  star: {
    marginHorizontal: 4,
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.radius.md,
    padding: SPACING.md,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    minHeight: 150,
    ...TYPOGRAPHY.body2,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
});
