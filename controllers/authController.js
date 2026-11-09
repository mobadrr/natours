const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const Email = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const creatSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production')
    cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  creatSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exist
  if (!email || !password)
    return next(
      new AppError('please provide email and password', 400)
    );

  //check if user exists && password is correct

  const user = await User.findOne({ email: email }).select(
    '+password'
  );

  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(
      new AppError('incorrect email or password', 401)
    );
  }

  creatSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        'you are not logged in , please log in to get access',
        401
      )
    );
  }
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError(
        'the user belonging to the user does no longer exist ',
        401
      )
    );
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'user recently changed the password , please login again ',
        401
      )
    );
  }
  req.user = freshUser;
  res.locals.user = freshUser;

  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }
      if (freshUser.changePasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = freshUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'you do not have permission to perform this action',
          403
        )
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    const user = await User.findOne({
      email: req.body.email
    });
    if (!user) {
      return next(
        new AppError(
          'there is no user with that email address',
          404
        )
      );
    }
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `forgot your password ? Submit a Patch request with your new password and passwordConfirm to : ${resetURL}.\n if you did not forget your password , please ignore this email`;

    try {
      // await sendEmail({
      //   email: user.email,
      //   subject:
      //     'your password reset token (valid for 10 minutes)',
      //   message
      // });

      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'token sent to email'
      });
    } catch (err) {
      console.log('EMAIL ERROR:', err);

      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new AppError('error sending email', 500));
    }
  }
);

exports.resetPassword = catchAsync(
  async (req, res, next) => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(
        new AppError('token is invalid or has expired', 400)
      );
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    creatSendToken(user, 200, res);
  }
);

exports.updatePassword = catchAsync(
  async (req, res, next) => {
    const user = await User.findById(req.user.id).select(
      '+password'
    );
    if (
      !(await user.correctPassword(
        req.body.passwordCurrent,
        user.password
      ))
    ) {
      return next(
        new AppError(
          'incorrect password please try again',
          401
        )
      );
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    creatSendToken(user, 200, res);

    //udpate password
    //log the user in
  }
);
