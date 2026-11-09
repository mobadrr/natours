const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('./../models/bookingModel');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('_overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the tour data (including reviews)
  const tour = await Tour.findOne({
    slug: req.params.slug
  }).populate({
    path: 'reviews',
    select: 'review rating user'
  });

  if (!tour) {
    return next(
      new AppError('there is no tour with that name', 404)
    );
  }

  // 2) Render the template using the tour data
  res.status(200).render('_tour', {
    title: `${tour.name} tour`,
    tour
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('_login', {
    title: 'Log into your account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('_account', {
    title: 'your account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings of the current user
  const bookings = await Booking.find({
    user: req.user.id
  });

  // 2) Find the tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('_overview', {
    title: 'My Tours',
    tours
  });
});

exports.updateUserData = catchAsync(
  async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );
    res.status(200).render('_account', {
      title: 'Your account',
      user: updatedUser
    });
  }
);
