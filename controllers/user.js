const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validateLogin, validateUser } = require('../utils/validate');
const { generateToken, generateRefreshToken } = require('../utils/token');
const nodemailer = require('nodemailer');

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

    const user = await User.findOne({ email: data.email });
    if (!user) {
      ctx.throw(404, 'User not found');
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

  console.log(email, password, newPassword);

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

exports.forgetPassword = async ctx => {
  try {
    const { verifyEmail } = ctx.request.body;
    console.log(verifyEmail);

    const user = await User.findOne({ email: verifyEmail });
    if (!user) {
      ctx.throw(400, 'User not found');
    } else {
      const token = jwt.sign(
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          password: user.password,
        },
        process.env.JWT_SECRET_FOR_VERIFY,
        { expiresIn: '10m' },
      );
      const body = {
        from: process.env.EMAIL_USER,
        to: `${verifyEmail}`,
        subject: 'Password Reset',
        html: `<h2>Hello ${verifyEmail}</h2>
        <p>A request has been received to change the password for your account </p>

        <p>This link will expire in <strong> 10 minute</strong>.</p>

        <p style="margin-bottom:20px;">Click this link for reset your password</p>

        <a href=${process.env.CLIENT_URL}/reset-password/${token} style="background:#0989FF;color:white;border:1px solid #0989FF; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Reset Password</a>


        <p style="margin-bottom:0px;">Thank you</p>
        <strong>Ngu Team</strong>
        `,
      };
      user.confirmationToken = token;
      const date = new Date();
      date.setDate(date.getDate() + 1);
      user.confirmationTokenExpires = date;
      await user.save({ validateBeforeSave: false });

      const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        service: process.env.SERVICE, //comment this line if you use custom server/domain
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
          user: '1924801040080@student.tdmu.edu.vn',
          pass: 'kingkiller@123#',
        },
      });

      transporter.verify(function (err, success) {
        if (err) {
          ctx.throw(500, err);
        } else {
          console.log('Server is ready to take our messages');
        }
      });

      transporter.sendMail(body, (err, data) => {
        if (err) {
          ctx.throw(500, err);
        } else {
          ctx.body = 'Email sent successfully';
        }
      });
    }
  } catch (error) {
    ctx.throw(500, error);
  }
};

// confirm-forget-password
exports.confirmForgetPassword = async ctx => {
  try {
    const { token, password } = ctx.request.body;
    const user = await User.findOne({ confirmationToken: token });

    if (!user) {
      ctx.throw(400, 'Invalid token');
    }

    const expired = new Date() > new Date(user.confirmationTokenExpires);

    if (expired) {
      ctx.throw(400, 'Token expired');
    } else {
      const newPassword = bcrypt.hashSync(password);
      await User.updateOne(
        { confirmationToken: token },
        { $set: { password: newPassword } },
      );

      user.confirmationToken = undefined;
      user.confirmationTokenExpires = undefined;

      await user.save({ validateBeforeSave: false });

      ctx.body = 'Password reset successfully';
    }
  } catch (error) {
    next(error);
  }
};
