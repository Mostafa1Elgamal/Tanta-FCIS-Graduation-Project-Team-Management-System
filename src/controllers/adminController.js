const User = require('../models/userModel');

exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isBanned: true,
        bannedAt: Date.now()
      },
      { new: true }
    );

    if (!user) {
      const error = new Error('No user found with that ID');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: 'success',
      message: 'User has been banned successfully',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};

exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isBanned: false,
        $unset: { bannedAt: "" }
      },
      { new: true }
    );

    if (!user) {
      const error = new Error('No user found with that ID');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: 'success',
      message: 'User has been unbanned successfully',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};
