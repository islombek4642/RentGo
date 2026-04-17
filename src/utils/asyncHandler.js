const asyncHandler = (fn) => (req, reqRes, next) => {
  Promise.resolve(fn(req, reqRes, next)).catch(next);
};

export default asyncHandler;
