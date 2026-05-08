const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error = new Error('You are not logged in! Please log in to get access.');
      error.statusCode = 401;
      return next(error);
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      const error = new Error('The user belonging to this token no longer exists.');
      error.statusCode = 401;
      return next(error);
    }

    // 4) Check if user is banned
    if (currentUser.isBanned) {
      const error = new Error('Your account has been banned. Please contact support.');
      error.statusCode = 403;
      return next(error);
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    const error = new Error('Invalid token or token expired');
    error.statusCode = 401;
    next(error);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error('You do not have permission to perform this action');
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};
