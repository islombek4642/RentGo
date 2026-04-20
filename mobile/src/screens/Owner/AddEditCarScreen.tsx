import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  Camera, 
  Car, 
  MapPin, 
  DollarSign, 
  Calendar,
  Layers,
  Settings,
  ChevronDown
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, SIZES, SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/Button';
import { toast } from '../../utils/toast';
import * as ImagePicker from 'expo-image-picker';
import CONFIG from '../../constants/config';

export default function AddEditCarScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const carId = route.params?.carId;
  const isEdit = !!carId;
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(isEdit);
  const [localImageUri, setLocalImageUri] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    price_per_day: '',
    location: '',
    region_id: null as number | null,
    district_id: null as number | null,
    is_available: true,
    image_url: ''
  });

  const [regions, setRegions] = React.useState<any[]>([]);
  const [districts, setDistricts] = React.useState<any[]>([]);
  const [showRegionModal, setShowRegionModal] = React.useState(false);
  const [showDistrictModal, setShowDistrictModal] = React.useState(false);
  const [locationLoading, setLocationLoading] = React.useState(false);

  React.useEffect(() => {
    fetchRegions();
    if (isEdit) {
      fetchCarDetails();
    }
  }, [isEdit]);

  const fetchRegions = async () => {
    try {
      const response = await api.get('/locations/regions');
      setRegions(response.data.data.regions);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    }
  };

  const fetchDistricts = async (regionId: number) => {
    setLocationLoading(true);
    try {
      const response = await api.get(`/locations/districts/${regionId}`);
      setDistricts(response.data.data.districts);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  const getLocalizedName = (item: any) => {
    const lang = t('common.lang_code') || 'uz';
    const l = lang === 'ru' ? 'ru' : (lang === 'oz' ? 'oz' : 'uz');
    return item[`name_${l}`] || item.name_uz;
  };

  const fetchCarDetails = async () => {
    try {
      const response = await api.get(`/cars/${carId}`);
      const car = response.data.data.car;
      setFormData({
        brand: car.brand,
        model: car.model,
        year: car.year.toString(),
        price_per_day: car.price_per_day.toString(),
        location: car.location,
        region_id: car.region_id,
        district_id: car.district_id,
        is_available: car.is_available,
        image_url: car.image_url || ''
      });
      if (car.region_id) {
        fetchDistricts(car.region_id);
      }
    } catch (error) {
      toast.error(t('common.error_occurred'));
      navigation.goBack();
    } finally {
      setFetching(false);
    }
  };



  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.error(t('common.permission_denied') || 'Gallery permission denied');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8
    });
    if (!result.canceled && result.assets.length > 0) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (
      !formData.brand.trim() || 
      !formData.model.trim() || 
      !formData.year || 
      !formData.price_per_day || 
      formData.region_id === null || 
      formData.district_id === null
    ) {
      toast.error(t('auth.fill_all'));
      return;
    }

    setLoading(true);
    try {
      const data = new FormData() as any;
      data.append('brand', formData.brand);
      data.append('model', formData.model);
      data.append('year', parseInt(formData.year).toString());
      const cleanPrice = formData.price_per_day.toString().replace(/[\s,]/g, '');
      data.append('price_per_day', parseFloat(cleanPrice).toString());
      data.append('location', formData.location || '');
      data.append('region_id', formData.region_id?.toString());
      data.append('district_id', formData.district_id?.toString());
      data.append('is_available', formData.is_available.toString());
      if (localImageUri) {
        const filename = localImageUri.split('/').pop() || 'car.jpg';
        const match = /\.([a-zA-Z]+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        data.append('image', { uri: localImageUri, name: filename, type } as any);
      }

      if (isEdit) {
        await api.patch(`/cars/${carId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(t('common.success'));
      } else {
        await api.post('/cars', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (user) {
          updateUser({ car_count: (user.car_count || 0) + 1 });
        }
        toast.success(t('common.success'));
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Error submitting car:', error);
      const msg = error.response?.data?.message || t('common.error_occurred');
      toast.error(t('common.error'), msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? t('owner.edit_car_title') : t('owner.add_car_title')}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
            {localImageUri || formData.image_url ? (
              <Image 
                source={{ 
                  uri: localImageUri || (formData.image_url.startsWith('http') 
                    ? formData.image_url 
                    : `${CONFIG.API_URL.replace(/\/api\/v1$/, '')}/${formData.image_url.replace(/^\//, '')}`)
                }} 
                style={styles.selectedImage} 
              />
            ) : (
              <>
                <Camera size={32} color={COLORS.gray[400]} />
                <Text style={styles.imageLabel}>{t('common.add_photo')}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('car.brand')}</Text>
              <View style={styles.inputWrapper}>
                <Car size={20} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder={t('car.placeholder_brand')}
                  value={formData.brand}
                  onChangeText={(text) => setFormData({ ...formData, brand: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('car.model')}</Text>
              <View style={styles.inputWrapper}>
                <Layers size={20} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder={t('car.placeholder_model')}
                  value={formData.model}
                  onChangeText={(text) => setFormData({ ...formData, model: text })}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.label}>{t('car.year')}</Text>
                <View style={styles.inputWrapper}>
                  <Calendar size={20} color={COLORS.gray[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('car.placeholder_year')}
                    keyboardType="numeric"
                    maxLength={4}
                    value={formData.year}
                    onChangeText={(text) => setFormData({ ...formData, year: text })}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1.5 }]}>
                <Text style={styles.label}>{t('booking.daily_rate')}</Text>
                <View style={styles.inputWrapper}>
                  <DollarSign size={20} color={COLORS.gray[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('car.placeholder_price')}
                    keyboardType="numeric"
                    value={formData.price_per_day}
                    onChangeText={(text) => setFormData({ ...formData, price_per_day: text })}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('filters.region')}</Text>
              <TouchableOpacity 
                style={styles.inputWrapper} 
                onPress={() => setShowRegionModal(true)}
              >
                <MapPin size={20} color={COLORS.gray[400]} />
                <Text style={[styles.input, !formData.region_id && { color: COLORS.gray[400] }]}>
                  {formData.region_id 
                    ? getLocalizedName(regions.find(r => r.id === formData.region_id)) 
                    : t('filters.region')}
                </Text>
                <ChevronDown size={20} color={COLORS.gray[400]} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('filters.district')}</Text>
              <TouchableOpacity 
                style={[styles.inputWrapper, !formData.region_id && styles.disabledInput]} 
                onPress={() => formData.region_id && setShowDistrictModal(true)}
                disabled={!formData.region_id || locationLoading}
              >
                <MapPin size={20} color={COLORS.gray[400]} />
                {locationLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: SPACING.sm }} />
                ) : (
                  <Text style={[styles.input, !formData.district_id && { color: COLORS.gray[400] }]}>
                    {formData.district_id 
                      ? getLocalizedName(districts.find(d => d.id === formData.district_id)) 
                      : t('filters.district')}
                  </Text>
                )}
                <ChevronDown size={20} color={COLORS.gray[400]} />
              </TouchableOpacity>
            </View>

            {/* Region Selection Modal */}
            <Modal
              visible={showRegionModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowRegionModal(false)}
            >
              <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setShowRegionModal(false)}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('filters.region')}</Text>
                    <TouchableOpacity onPress={() => setShowRegionModal(false)}>
                      <Text style={styles.closeText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalList} showsVerticalScrollIndicator={true}>
                    {regions.map((region) => (
                      <TouchableOpacity 
                        key={region.id} 
                        style={styles.modalItem}
                        onPress={() => {
                          setFormData({ ...formData, region_id: region.id, district_id: null });
                          fetchDistricts(region.id);
                          setShowRegionModal(false);
                        }}
                      >
                        <Text style={[
                          styles.modalItemText,
                          formData.region_id === region.id && styles.selectedItemText
                        ]}>
                          {getLocalizedName(region)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* District Selection Modal */}
            <Modal
              visible={showDistrictModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowDistrictModal(false)}
            >
              <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setShowDistrictModal(false)}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('filters.district')}</Text>
                    <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                      <Text style={styles.closeText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalList} showsVerticalScrollIndicator={true}>
                    {districts.map((district) => (
                      <TouchableOpacity 
                        key={district.id} 
                        style={styles.modalItem}
                        onPress={() => {
                          setFormData({ ...formData, district_id: district.id });
                          setShowDistrictModal(false);
                        }}
                      >
                        <Text style={[
                          styles.modalItemText,
                          formData.district_id === district.id && styles.selectedItemText
                        ]}>
                          {getLocalizedName(district)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>

            {isEdit && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('common.status')}</Text>
                <TouchableOpacity 
                   style={styles.statusToggle}
                   onPress={() => setFormData({ ...formData, is_available: !formData.is_available })}
                >
                  <View style={[
                    styles.toggleTrack, 
                    { backgroundColor: formData.is_available ? COLORS.success : COLORS.gray[200] }
                  ]}>
                    <View style={[
                      styles.toggleThumb, 
                      { transform: [{ translateX: formData.is_available ? 22 : 2 }] }
                    ]} />
                  </View>
                  <Text style={styles.statusLabel}>
                    {formData.is_available ? t('status.confirmed') : t('car.not_available')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Button 
              title={isEdit ? t('common.save') : t('owner.add_car_title')}
              onPress={handleSave}
              loading={loading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.radius.lg,
    borderWidth: 2,
    borderColor: COLORS.gray[100],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imageLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
  },
  form: {
    gap: SPACING.md,
  },
  inputGroup: {
    gap: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SPACING.md,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  input: {
    flex: 1,
    marginLeft: SPACING.sm,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  toggleTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  statusLabel: {
    marginLeft: SPACING.sm,
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: COLORS.gray[100],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius.xl,
    borderTopRightRadius: SIZES.radius.xl,
    maxHeight: '80%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  closeText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalList: {
    padding: SPACING.md,
  },
  modalItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  modalItemText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  selectedItemText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
