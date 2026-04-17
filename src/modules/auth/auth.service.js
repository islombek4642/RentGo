import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import authRepository from './auth.repository.js';
import AppError from '../../utils/AppError.js';
import { t } from '../../utils/i18n.js';
import { HTTP_STATUS, SYSTEM_CONFIG } from '../../constants/index.js';

class AuthService {
  async register(userData, lang) {
    const { name, phone, password, role } = userData;

    // 1) Check if user exists
    const existingUser = await authRepository.findByPhone(phone);
    if (existingUser) {
      throw new AppError(t(lang, 'auth.phone_exists'), HTTP_STATUS.BAD_REQUEST);
    }

    // 2) Hash password
    const hashedPassword = await bcrypt.hash(password, SYSTEM_CONFIG.BCRYPT_SALT_ROUNDS);

    // 3) Create user
    const newUser = await authRepository.create({
      name,
      phone,
      password: hashedPassword,
      role,
    });

    // 4) Generate tokens
    const tokens = await this.generateTokens(newUser.id);

    return { user: newUser, ...tokens };
  }

  async login(phone, password, lang) {
    // 1) Find user
    const user = await authRepository.findByPhone(phone);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(t(lang, 'auth.invalid_credentials'), HTTP_STATUS.UNAUTHORIZED);
    }

    // 2) Generate tokens
    const tokens = await this.generateTokens(user.id);

    // Don't send password in response
    delete user.password;

    return { user, ...tokens };
  }

  async refresh(refreshToken, lang) {
    // 1) Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    
    // 2) Check if token exists in DB
    const tokenInDb = await authRepository.findRefreshToken(refreshToken);
    if (!tokenInDb) {
      throw new AppError(t(lang, 'common.unauthorized'), HTTP_STATUS.UNAUTHORIZED);
    }

    // 3) Generate new tokens
    const tokens = await this.generateTokens(decoded.id);

    // 4) Delete old refresh token from DB
    await authRepository.deleteRefreshToken(refreshToken);

    return tokens;
  }

  async logout(refreshToken) {
    await authRepository.deleteRefreshToken(refreshToken);
  }

  async generateTokens(id) {
    const accessToken = jwt.sign({ id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign({ id }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    // Store refresh token in DB
    const decodedRefresh = jwt.decode(refreshToken);
    const expiresAt = new Date(decodedRefresh.exp * 1000);
    
    await authRepository.createRefreshToken(id, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }
}

export default new AuthService();
