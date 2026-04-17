import userService from './users.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../constants/index.js';

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
}

export default new UserController();
