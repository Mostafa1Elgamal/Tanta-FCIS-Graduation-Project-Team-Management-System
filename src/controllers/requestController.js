const Request = require('../models/requestModel');
const Team = require('../models/teamModel');
const User = require('../models/userModel');
const NotificationService = require('../services/notificationService');

exports.applyToTeam = async (req, res, next) => {
  try {
    const { teamId, track, message } = req.body;

    // 1) Check if user is already in a team
    if (req.user.status === 'IN_TEAM') {
      const error = new Error('You are already in a team and cannot apply');
      error.statusCode = 400;
      return next(error);
    }

    // 2) Check if team exists and is incomplete
    const team = await Team.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      return next(error);
    }

    if (team.status === 'COMPLETE') {
      const error = new Error('Team is already full');
      error.statusCode = 400;
      return next(error);
    }

    // 3) Create request
    const newRequest = await Request.create({
      senderId: req.user.id,
      teamId,
      type: 'APPLICATION',
      track,
      message
    });

    // 4) Notify team leader
    const io = req.app.get('io');
    await NotificationService.sendNotification(
      io,
      team.leaderId,
      `${req.user.name} applied to join your team ${team.title}`,
      'NEW_APPLICATION',
      newRequest._id
    );

    res.status(201).json({
      status: 'success',
      data: { request: newRequest }
    });
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('You have already applied to this team');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};

exports.inviteUser = async (req, res, next) => {
  try {
    const { userId, teamId, track, message } = req.body;

    // 1) Check if team exists and user is leader
    const team = await Team.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      return next(error);
    }

    if (team.leaderId.toString() !== req.user.id) {
      const error = new Error('Only the team leader can invite users');
      error.statusCode = 403;
      return next(error);
    }

    // 2) Check if user to invite exists and is LOOKING
    const userToInvite = await User.findById(userId);
    if (!userToInvite || userToInvite.status === 'IN_TEAM') {
      const error = new Error('User is already in a team or not found');
      error.statusCode = 400;
      return next(error);
    }

    // 3) Create request
    const newRequest = await Request.create({
      senderId: req.user.id,
      receiverId: userId,
      teamId,
      type: 'INVITATION',
      track,
      message
    });

    // 4) Notify user
    const io = req.app.get('io');
    await NotificationService.sendNotification(
      io,
      userId,
      `You have been invited to join team ${team.title}`,
      'INVITATION_RECEIVED',
      newRequest._id
    );

    res.status(201).json({
      status: 'success',
      data: { request: newRequest }
    });
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('Invitation already sent to this user');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};

exports.acceptRequest = async (req, res, next) => {
  const session = await Request.startSession();
  session.startTransaction();
  try {
    const request = await Request.findById(req.params.id).session(session);
    if (!request || request.status !== 'PENDING') {
      const error = new Error('Request not found or already processed');
      error.statusCode = 404;
      return next(error);
    }

    const team = await Team.findById(request.teamId).session(session);
    if (team.currentSize >= team.totalSize) {
      const error = new Error('Team is full');
      error.statusCode = 400;
      return next(error);
    }

    let userIdToJoin;
    if (request.type === 'APPLICATION') {
      // Leader accepts application
      if (team.leaderId.toString() !== req.user.id) {
        const error = new Error('Only the team leader can accept applications');
        error.statusCode = 403;
        return next(error);
      }
      userIdToJoin = request.senderId;
    } else {
      // User accepts invitation
      if (request.receiverId.toString() !== req.user.id) {
        const error = new Error('Only the invited user can accept this invitation');
        error.statusCode = 403;
        return next(error);
      }
      userIdToJoin = req.user.id;
    }

    const userToJoin = await User.findById(userIdToJoin).session(session);
    if (userToJoin.status === 'IN_TEAM') {
      const error = new Error('User is already in another team');
      error.statusCode = 400;
      return next(error);
    }

    // 1) Update Request
    request.status = 'ACCEPTED';
    await request.save({ session });

    // 2) Update User Status and Team
    userToJoin.status = 'IN_TEAM';
    userToJoin.team = team._id;
    await userToJoin.save({ session });

    // 3) Update Team Members and Size
    team.members.push({
      userId: userIdToJoin,
      role: request.track || 'Member',
      joinedAt: Date.now()
    });
    team.currentSize += 1;
    
    // Update required tracks if matched
    if (request.track) {
      const trackIndex = team.requiredTracks.findIndex(t => t.track === request.track && t.neededCount > 0);
      if (trackIndex > -1) {
        team.requiredTracks[trackIndex].neededCount -= 1;
      }
    }

    await team.save({ session });

    // 4) Reject all other pending requests for this user
    await Request.updateMany(
      { 
        $or: [
          { senderId: userIdToJoin, status: 'PENDING' },
          { receiverId: userIdToJoin, status: 'PENDING' }
        ],
        _id: { $ne: request._id }
      },
      { status: 'REJECTED' },
      { session }
    );

    // 5) Commit Transaction
    await session.commitTransaction();
    session.endSession();

    // 6) Notify participants
    const io = req.app.get('io');
    const notifyUserId = request.type === 'APPLICATION' ? request.senderId : team.leaderId;
    const notifyContent = request.type === 'APPLICATION' 
      ? `Your application to team ${team.title} was accepted!` 
      : `${userToJoin.name} accepted your invitation to join ${team.title}`;

    await NotificationService.sendNotification(
      io,
      notifyUserId,
      notifyContent,
      'REQUEST_ACCEPTED',
      team._id
    );

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request || request.status !== 'PENDING') {
      const error = new Error('Request not found or already processed');
      error.statusCode = 404;
      return next(error);
    }

    const team = await Team.findById(request.teamId);

    // Permission check
    if (request.type === 'APPLICATION') {
      if (team.leaderId.toString() !== req.user.id) {
        const error = new Error('Only the team leader can reject applications');
        error.statusCode = 403;
        return next(error);
      }
    } else {
      if (request.receiverId.toString() !== req.user.id) {
        const error = new Error('Only the invited user can reject this invitation');
        error.statusCode = 403;
        return next(error);
      }
    }

    request.status = 'REJECTED';
    await request.save();

    // Notify sender
    const io = req.app.get('io');
    const notifyUserId = request.type === 'APPLICATION' ? request.senderId : team.leaderId;
    const notifyContent = request.type === 'APPLICATION' 
      ? `Your application to team ${team.title} was rejected.` 
      : `${req.user.name} rejected your invitation to join ${team.title}`;

    await NotificationService.sendNotification(
      io,
      notifyUserId,
      notifyContent,
      'REQUEST_REJECTED',
      request._id
    );

    res.status(200).json({
      status: 'success',
      message: 'Request rejected'
    });
  } catch (err) {
    next(err);
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    // 1) Find teams led by user
    const myTeams = await Team.find({ leaderId: req.user.id });
    const myTeamIds = myTeams.map(t => t._id);

    // 2) Find requests where user is sender, receiver, OR team leader
    const requests = await Request.find({
      $or: [
        { senderId: req.user.id },
        { receiverId: req.user.id },
        { teamId: { $in: myTeamIds } }
      ]
    })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .populate('teamId', 'title description leaderId');

    res.status(200).json({
      status: 'success',
      results: requests.length,
      data: { requests }
    });
  } catch (err) {
    next(err);
  }
};
