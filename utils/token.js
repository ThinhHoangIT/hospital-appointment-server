const jwt = require('jsonwebtoken');
// generate token
exports.generateToken = user => {
  const token = jwt.sign(
    {
      name: user.name,
      email: user.email,
      password: user.password,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    },
  );
  return token;
};

// generate refreshToken
exports.generateRefreshToken = user => {
  return jwt.sign(
    {
      name: user.name,
      email: user.email,
      password: user.password,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.REFRESH_JWT_EXPIRE_TIME },
  );
};
