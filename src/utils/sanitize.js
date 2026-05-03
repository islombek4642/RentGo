/**
 * Sanitizes sensitive data from objects before logging or returning to client
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
export const sanitizeAuditData = (data) => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveFields = [
    'password', 
    'password_hash', 
    'passwordHash',
    'token', 
    'accessToken', 
    'refreshToken',
    'jwt',
    'secret',
    'otp',
    'card_number',
    'cvv'
  ];

  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeAuditData(sanitized[key]);
    }
  });

  return sanitized;
};
