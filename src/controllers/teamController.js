const Team = require('../models/teamModel');
const User = require('../models/userModel');

exports.createTeam = async (req, res, next) => {
  try {
    // 1) Check if user is already in a team
    if (req.user.status === 'IN_TEAM') {
      const error = new Error('You are already in a team and cannot create a new one');
      error.statusCode = 400;
      return next(error);
    }

    // 2) Create the team
    const { title, description, totalSize, requiredTracks, leaderRole } = req.body;
    
    const newTeam = await Team.create({
      title,
      description,
      totalSize,
      requiredTracks,
      leaderId: req.user.id,
      members: [{
        userId: req.user.id,
        role: leaderRole || 'Leader',
        joinedAt: Date.now()
      }],
      currentSize: 1
    });

    // 3) Update user status
    await User.findByIdAndUpdate(req.user.id, { status: 'IN_TEAM' });

    res.status(201).json({
      status: 'success',
      data: { team: newTeam }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllTeams = async (req, res, next) => {
  try {
    const { status, track, isPrivate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (isPrivate) query.isPrivate = isPrivate === 'true';
    if (track) query['requiredTracks.track'] = track;

    const teams = await Team.find(query).populate('leaderId', 'name email');

    res.status(200).json({
      status: 'success',
      results: teams.length,
      data: { teams }
    });
  } catch (err) {
    next(err);
  }
};

exports.getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leaderId', 'name email tracks skills bio')
      .populate('members.userId', 'name email tracks skills bio');

    if (!team) {
      const error = new Error('No team found with that ID');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      const error = new Error('No team found with that ID');
      error.statusCode = 404;
      return next(error);
    }

    // Check if user is the leader
    if (team.leaderId.toString() !== req.user.id) {
      const error = new Error('Only the team leader can update team details');
      error.statusCode = 403;
      return next(error);
    }

    const updatedTeam = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { team: updatedTeam }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      const error = new Error('No team found with that ID');
      error.statusCode = 404;
      return next(error);
    }

    // Check if user is the leader
    if (team.leaderId.toString() !== req.user.id) {
      const error = new Error('Only the team leader can delete the team');
      error.statusCode = 403;
      return next(error);
    }

    // Reset all members' status to LOOKING
    const memberIds = team.members.map(m => m.userId);
    await User.updateMany({ _id: { $in: memberIds } }, { status: 'LOOKING' });

    await Team.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
