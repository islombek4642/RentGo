import AppError from '../utils/AppError.js';
import { t } from '../utils/i18n.js';

const validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    // Collect all error messages
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    
    // For production, we might want a generalized message or specific localized ones
    // For now, let's use the localized "validation_error" generic message
    return next(new AppError(`${t(req.lang, 'common.validation_error')}: ${errorMessage}`, 400));
  }

  // Replace req.body with validated value
  req.body = value;
  next();
};

export default validate;
