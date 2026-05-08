const User = require('../models/userModel');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { status, track, department } = req.query;
    const query = {};

    if (status) query.status = status;
    if (track) query.tracks = track;
    if (department) query.department = department;

    const users = await User.find(query).select('-isBanned -bannedAt');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error('No user found with that ID');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    // 1) Filter out unwanted fields that are not allowed to be updated
    const { name, phoneNumber, department, tracks, skills, bio } = req.body;
const filteredBody = { name, phoneNumber, department, tracks, skills, bio };

    // 2) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (err) {
    next(err);
  }
};
