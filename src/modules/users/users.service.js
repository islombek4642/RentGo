import bcrypt from 'bcrypt';
import userRepository from './users.repository.js';
import AppError from '../../utils/AppError.js';
import { t } from '../../utils/i18n.js';
import { HTTP_STATUS, SYSTEM_CONFIG } from '../../constants/index.js';

class UserService {
  async getProfile(userId, lang) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(t(lang, 'common.internal_error'), HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }

  async updateProfile(userId, updateData, lang) {
    const { name, phone } = updateData;
    
    // If phone is changing, check for duplicates
    if (phone) {
      const existingUser = await userRepository.findByPhone(phone);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Ushbu telefon raqami allaqachon ro\'yxatdan o\'tgan', HTTP_STATUS.CONFLICT);
      }
    }

    const user = await userRepository.update(userId, { name, phone });
    if (!user) {
      throw new AppError(t(lang, 'common.internal_error'), HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }

  async changePassword(userId, data, lang) {
    const { current_password, new_password } = data;

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError(t(lang, 'common.internal_error'), HTTP_STATUS.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      throw new AppError('Joriy parol noto\'g\'ri', HTTP_STATUS.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(new_password, SYSTEM_CONFIG.BCRYPT_SALT_ROUNDS);
    await userRepository.updatePassword(userId, hashedPassword);
  }

  async uploadLicense(userId, filePath, lang) {
    const user = await userRepository.update(userId, { 
      license_image_url: filePath,
      is_verified: false // Reset or keep false until admin review
    });
    
    if (!user) {
      throw new AppError(t(lang, 'common.internal_error'), HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }
}

export default new UserService();
