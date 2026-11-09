const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};

// Get all reviews
exports.getReviews = factory.getAll(Review);

// Create a review
exports.createReview = factory.createOne(Review);

//delete a review
exports.deleteReview = factory.deleteOne(Review);

//update Review
exports.updateReview = factory.updateOne(Review);

//getting review
exports.getreview = factory.getOne(Review);
