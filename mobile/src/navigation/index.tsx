import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store/useAuthStore';

// Navigators
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

// Screens that are above tabs
import CarDetailScreen from '../screens/Main/CarDetailScreen';
import BookingScreen from '../screens/Main/BookingScreen';
import BookingSuccessScreen from '../screens/Main/BookingSuccessScreen';
import OwnerDashboardScreen from '../screens/Owner/OwnerDashboardScreen';
import MyCarsScreen from '../screens/Owner/MyCarsScreen';
import AddEditCarScreen from '../screens/Owner/AddEditCarScreen';
import ReviewScreen from '../screens/Main/ReviewScreen';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { t } = useTranslation();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen 
            name="CarDetail" 
            component={CarDetailScreen} 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="BookingConfirm" 
            component={BookingScreen} 
            options={{ 
              headerShown: false, 
            }} 
          />
          <Stack.Screen 
            name="BookingSuccess" 
            component={BookingSuccessScreen} 
            options={{ 
              headerShown: false,
              gestureEnabled: false
            }} 
          />
          {/* Owner Stack */}
          <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
          <Stack.Screen name="MyCars" component={MyCarsScreen} />
          <Stack.Screen name="AddCar" component={AddEditCarScreen} />
          <Stack.Screen name="EditCar" component={AddEditCarScreen} />
          <Stack.Screen name="Review" component={ReviewScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
