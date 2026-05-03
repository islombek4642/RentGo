import api from './api';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const userService = {
  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.patch('/users/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await api.patch('/users/change-password', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  }
};
