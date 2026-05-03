import userService from './users.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

class UserController {
  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.id, req.lang);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { user },
    });
  });

  updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body, req.lang);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { user },
    });
  });

  changePassword = asyncHandler(async (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      throw new AppError('Yangi parollar bir-biriga mos kelmadi', HTTP_STATUS.BAD_REQUEST);
    }

    if (new_password.length < 8) {
      throw new AppError('Parol kamida 8 ta belgidan iborat bo\'lishi kerak', HTTP_STATUS.BAD_REQUEST);
    }

    await userService.changePassword(req.user.id, { current_password, new_password }, req.lang);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Parol muvaffaqiyatli o\'zgartirildi',
    });
  });

  uploadLicense = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Please provide a license image', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await userService.uploadLicense(req.user.id, req.file.path, req.lang);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { user },
    });
  });
}

export default new UserController();
