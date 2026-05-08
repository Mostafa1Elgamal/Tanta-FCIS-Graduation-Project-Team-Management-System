const User = require('../models/userModel');
const { createSendToken } = require('../utils/jwt');

exports.register = async (req, res, next) => {
  try {
    const { name, phoneNumber, email, password, department, tracks, skills, bio } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      const error = new Error('User with this phone number already exists');
      error.statusCode = 400;
      return next(error);
    }

    const newUser = await User.create({
      name,
      phoneNumber,
      email,
      password,
      department,
      tracks,
      skills,
      bio
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;

    // 1) Check if phoneNumber and password exist
    if (!phoneNumber || !password) {
      const error = new Error('Please provide phone number and password');
      error.statusCode = 400;
      return next(error);
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ phoneNumber }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      const error = new Error('Incorrect phone number or password');
      error.statusCode = 401;
      return next(error);
    }

    // 2.5) Check if user is banned
    if (user.isBanned) {
      const error = new Error('Your account has been suspended. Please contact support.');
      error.statusCode = 403;
      return next(error);
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('team');
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};
