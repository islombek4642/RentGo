import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  CarDetail: { carId: string };
  BookingDetail: { bookingId: string };
  BookingConfirm: { carId: string; startDate: string; endDate: string };
  BookingSuccess: { bookingId: string; carName: string; totalPrice: number; dates: string };
  // Owner Screens
  OwnerDashboard: undefined;
  MyCars: undefined;
  AddCar: undefined;
  EditCar: { carId: string };
  Review: { carId: string; bookingId: string };
};
