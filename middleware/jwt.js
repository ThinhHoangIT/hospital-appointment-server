const customJWTMiddleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: err.originalError ? err.originalError.message : err.message,
      };
    } else {
      throw err;
    }
  }
};

module.exports = customJWTMiddleware;
