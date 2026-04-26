import authService from './auth.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { t } from '../../utils/i18n.js';
import { HTTP_STATUS } from '../../constants/index.js';
import { trackAuth, ANALYTICS_EVENTS } from '../../config/analytics.js';

class AuthController {
  register = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body, req.lang);
    
    trackAuth(ANALYTICS_EVENTS.AUTH.REGISTER_SUCCESS, user.id, { phone: req.body.phone });

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: t(req.lang, 'auth.registration_success'),
      data: { 
        user,
        tokens: { accessToken, refreshToken }
      },
    });
  });

  login = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(phone, password, req.lang);
    
    trackAuth(ANALYTICS_EVENTS.AUTH.LOGIN_SUCCESS, user.id, { phone });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: t(req.lang, 'auth.login_success'),
      data: { 
        user,
        tokens: { accessToken, refreshToken }
      },
    });
  });

  refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken, req.lang);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { tokens },
    });
  });

  logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    
    trackAuth(ANALYTICS_EVENTS.AUTH.LOGOUT, req.user?.id || 'anonymous');

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: t(req.lang, 'auth.logged_out'),
    });
  });
}

export default new AuthController();
