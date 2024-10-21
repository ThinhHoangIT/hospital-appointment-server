const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { validateLogin, validateUser } = require('../utils/validate');
const { generateToken, generateRefreshToken } = require('../utils/token');

exports.getAllUsers = async ctx => {
  try {
    const query = {};
    if (ctx.query.keyword) {
      query.searchIndex = { $regex: ctx.query.keyword, $options: 'i' };
    }
    const users = await User.find(query).select('-__v').lean();
    ctx.body = users;
  } catch (error) {
    ctx.throw(500, error);
  }
};

exports.getUserById = async ctx => {
  try {
    const user = await User.findById({ _id: ctx.params.id }).select(
      '-password -__v',
    );
    if (!user) {
      ctx.throw(404, 'User not found');
    }
    ctx.body = user;
  } catch (error) {
    ctx.throw(500, error);
  }
};

exports.createUser = async ctx => {
  try {
    const data = ctx.request.body;
    const { error } = validateUser(data);
    if (error) {
      ctx.throw(400, error.details[0].message);
    }

    const hasEmail = await User.findOne({ email: data.email });
    if (hasEmail) {
      ctx.throw(400, 'Email is already exists');
    }

    if (data.password) {
      data.password = data.password;
    }

    const newUser = new User(data);
    const savedUser = await newUser.save({ validateBeforeSave: false });

    ctx.body = savedUser;
  } catch (error) {
    ctx.throw(500, error);
  }
};

exports.updateUser = async ctx => {
  try {
    const data = ctx.request.body;
    const { error } = validateUser(data);
    if (error) {
      ctx.throw(400, error.details[0].message);
    }

    const user = await User.findOne({ email: data.email });
    if (!user) {
      ctx.throw(404, 'User not found');
    }

    if (data.phone && data.phone !== user.phone) {
      const hasPhone = await User.findOne({ phone: data.phone });
      if (hasPhone) {
        ctx.throw(400, 'Phone is already exists');
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: data.email },
      data,
      { new: true, runValidators: true },
    ).select('-password -__v');

    ctx.body = updatedUser;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.deleteUser = async ctx => {
  try {
    const user = await User.findByIdAndDelete(
      { _id: ctx.params.id },
      { userId: ctx.state.user.id, id: ctx.params.id },
    );
    if (!user) {
      ctx.throw(404, 'User not found');
    }
    ctx.body = 'User was deleted';
  } catch (error) {
    ctx.throw(500, error);
  }
};

exports.login = async ctx => {
  try {
    const { error } = validateLogin(ctx.request.body);
    if (error) {
      ctx.throw(400, error.details[0].message);
    }

    const { email, password } = ctx.request.body;
    const user = await User.findOne({ email }).select('-__v').lean();
    if (!user) {
      ctx.throw(400, 'Invalid email!');
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      ctx.throw(400, 'Invalid password!');
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    ctx.body = {
      ...user,
      token,
      refreshToken,
    };
  } catch (error) {
    ctx.throw(500, error);
  }
};

exports.refreshToken = async ctx => {
  const { refreshToken } = ctx.request.body;
  try {
    const { id } = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

    const user = await User.findById({ id }).select('-__v').lean();
    if (!user) {
      ctx.throw(400, 'Invalid token');
    }
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    ctx.body = {
      ...user,
      token: newToken,
      refreshToken: newRefreshToken,
    };
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.changePassword = async ctx => {
  const { email, password, newPassword } = ctx.request.body;

  const user = await User.findOne({ email });
  if (!user) {
    ctx.throw(400, 'User not found');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    ctx.throw(400, 'Incorrect password');
  }

  // Cập nhật mật khẩu mới (middleware sẽ tự động hash)
  user.password = newPassword;
  await user.save(); // Middleware sẽ hash mật khẩu tại đây

  ctx.body = 'Password changed successfully';
};

exports.updateUserStatus = async ctx => {
  try {
    const { newStatus } = ctx.request.body;

    const user = await User.findByIdAndUpdate(
      ctx.params.id,
      { status: newStatus },
      { new: true },
    );
    if (!user) {
      ctx.throw(404, 'User not found');
    }
    ctx.body = user;
  } catch (err) {
    ctx.throw(500, err);
  }
};
