const responseMiddleware = async (ctx, next) => {
  try {
    await next();
    if (ctx.body) {
      if (!ctx.state.isFile) {
        ctx.body = {
          success: true,
          message: 'ok',
          data: ctx.body,
        };
      }
    }
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message,
    };
  }
};

module.exports = responseMiddleware;
