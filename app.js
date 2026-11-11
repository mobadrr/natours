const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSantitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewsRoutes');
const { title } = require('process');

const app = express();
app.enable('trust proxy');

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//// Global middle wares
//set sequrity HTTP headers

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'script-src': [
          "'self'",
          'https://api.mapbox.com',
          'https://cdnjs.cloudflare.com',
          'https://cdn.jsdelivr.net'
        ],
        'worker-src': ["'self'", 'blob:'],
        'child-src': ["'self'", 'blob:'],
        'img-src': ["'self'", 'data:', 'blob:'],
        'connect-src': [
          "'self'",
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://cdn.jsdelivr.net',
          'ws://127.0.0.1:*'
        ]
      }
    }
  })
);
//development logging

// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'too many requests from this ip , please try again in an hour'
});

app.use('/api', limiter);

// body parser , reading data from body into rq.body

app.use(express.json({ limit: '10kb' }));
app.use(
  express.urlencoded({ extended: true, limit: '10kb' })
);
app.use(cookieParser());

// Data sanitization against noSQL query injection

app.use(mongoSantitize());

//data sanitization against XSS attacks

app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());
//serving static files

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
//express
//router mounting
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `can not find ${req.originalUrl} on this server`,
      404
    )
  );
});

app.use(globalErrorHandler);

///start server

module.exports = app;
