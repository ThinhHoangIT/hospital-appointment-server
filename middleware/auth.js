const authMiddleware = async (ctx, next) => {
  if (ctx.url.includes('/auth/')) {
    //
  } else {
    return next();
  }
};

module.exports = authMiddleware;
