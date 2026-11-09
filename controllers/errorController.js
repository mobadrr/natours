const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleJWTExpiredError = () =>
  new AppError('Expired token, please login again', 401);

const handleJsonWebTokenError = () =>
  new AppError('Invalid token, please login again', 401);

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value} please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = err => {
  const errors = Object.values(err.errors).map(
    el => el.message
  );
  const message = `Invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // الصفحات
  return res.status(err.statusCode).render('_error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }

  // الصفحات
  if (err.isOperational) {
    return res.status(err.statusCode).render('_error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('_error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError')
      error = handleCastErrorDB(err);
    if (err.code === 11000)
      error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError')
      error = handleValidationErrorDb(err);
    if (err.name === 'TokenExpiredError')
      error = handleJWTExpiredError();
    if (err.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError();

    sendErrorProd(error, req, res);
  }
};
