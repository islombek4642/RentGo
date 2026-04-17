import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import HomeScreen from '../screens/Main/HomeScreen';
import BookingScreen from '../screens/Main/BookingScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import { COLORS } from '../constants/theme';
import { Home, Calendar, User } from 'lucide-react-native';

import { useTranslation } from 'react-i18next';

import MyBookingsScreen from '../screens/Main/MyBookingsScreen';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.gray[100],
          height: 60 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          backgroundColor: COLORS.white,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          tabBarLabel: t('nav.home'),
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
          title: t('nav.bookings'),
          tabBarLabel: t('nav.bookings'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          title: t('nav.profile'),
          tabBarLabel: t('nav.profile'),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
