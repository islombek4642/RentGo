import multer from 'multer';
import path from 'path';
import { config } from '../config/env.js';
import AppError from '../utils/AppError.js';
import fs from 'fs';
import { t } from '../utils/i18n.js';
import { SYSTEM_CONFIG } from '../constants/index.js';

// Ensure upload directory exists
if (!fs.existsSync(config.uploadPath)) {
  fs.mkdirSync(config.uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png/;
  const allowedMimetypes = /image\/jpeg|image\/jpg|image\/png/;

  const extension = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimetypes.test(file.mimetype);

  if (extension && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError(t(req.lang, 'profile.upload_invalid_type') || 'Only .png, .jpg and .jpeg format allowed!', 400), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: SYSTEM_CONFIG.MAX_UPLOAD_SIZE,
  },
});
