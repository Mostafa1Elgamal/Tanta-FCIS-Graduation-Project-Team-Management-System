const User = require('../models/userModel');
const { createSendToken } = require('../utils/jwt');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, department, tracks, skills, bio } = req.body;

    const newUser = await User.create({
      name,
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
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      const error = new Error('Please provide email and password');
      error.statusCode = 400;
      return next(error);
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      const error = new Error('Incorrect email or password');
      error.statusCode = 401;
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
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};
