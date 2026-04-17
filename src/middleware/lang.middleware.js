const supportedLangs = ['uz', 'ru', 'en'];
const defaultLang = 'uz';

export const langMiddleware = (req, res, next) => {
  // 1) Get from header
  const headerValue = req.headers['accept-language'];

  if (!headerValue) {
    req.lang = defaultLang;
    return next();
  }

  // 2) Parse the header (e.g., "en-US,en;q=0.9,ru;q=0.8,uz;q=0.7")
  // For simplicity, we take the primary language of the first part
  const requestedLang = headerValue.split(',')[0].split('-')[0].toLowerCase();

  // 3) Normalize and check support
  if (supportedLangs.includes(requestedLang)) {
    req.lang = requestedLang;
  } else {
    req.lang = defaultLang;
  }

  next();
};
