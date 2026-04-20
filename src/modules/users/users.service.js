import userRepository from './users.repository.js';
import AppError from '../../utils/AppError.js';
import { t } from '../../utils/i18n.js';
import { HTTP_STATUS } from '../../constants/index.js';

class UserService {
  async getProfile(userId, lang) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(t(lang, 'common.internal_error'), HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }

  async updateProfile(userId, updateData, lang) {
    const user = await userRepository.update(userId, updateData);
    if (!user) {
      throw new AppError(t(lang, 'common.internal_error'), HTTP_STATUS.NOT_FOUND);
    }
    return user;
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
