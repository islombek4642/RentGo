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
