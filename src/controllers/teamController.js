const Team = require('../models/teamModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const NotificationService = require('../services/notificationService');

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

    // 3) Update user status and team
    await User.findByIdAndUpdate(req.user.id, { 
      status: 'IN_TEAM',
      team: newTeam._id
    });

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

    const teams = await Team.find(query).populate('leaderId', 'name phoneNumber email');

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
      .populate('leaderId', 'name phoneNumber email tracks skills bio')
      .populate('members.userId', 'name phoneNumber email tracks skills bio');

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

    // Check if user is the leader OR an admin
    const isAdmin = req.user.role === 'admin';
    if (team.leaderId.toString() !== req.user.id && !isAdmin) {
      const error = new Error('Only the team leader or an admin can delete the team');
      error.statusCode = 403;
      return next(error);
    }

    // Reset all members' status and team
    const memberIds = team.members.map(m => m.userId);
    await User.updateMany(
      { _id: { $in: memberIds } }, 
      { status: 'LOOKING', $unset: { team: "" } }
    );

    await Team.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { phoneNumber, role } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      return next(error);
    }

    if (team.leaderId.toString() !== req.user.id) {
      const error = new Error('Only the team leader can add members');
      error.statusCode = 403;
      return next(error);
    }

    if (team.currentSize >= team.totalSize) {
      const error = new Error('Team is already full');
      error.statusCode = 400;
      return next(error);
    }

    const userToAdd = await User.findOne({ phoneNumber });
    if (!userToAdd) {
      const error = new Error('User not found with this phone number');
      error.statusCode = 404;
      return next(error);
    }

    // Check if already in this team
    if (userToAdd.team?.toString() === team._id.toString()) {
      const error = new Error('User is already a member of this team');
      error.statusCode = 400;
      return next(error);
    }

    // Check conflict
    if (userToAdd.status === 'IN_TEAM') {
      // Send switch request notification
      const io = req.app.get('io');
      await NotificationService.sendNotification(
        io,
        userToAdd._id,
        `Team "${team.title}" wants to add you. You are currently in another team.`,
        'TEAM_SWITCH_REQUEST',
        team._id
      );

      return res.status(200).json({
        status: 'success',
        message: 'User is in another team. A switch request has been sent.',
        conflict: true
      });
    }

    // No conflict, add immediately
    team.members.push({
      userId: userToAdd._id,
      role: role || 'Member',
      joinedAt: Date.now()
    });
    team.currentSize += 1;
    await team.save();

    userToAdd.status = 'IN_TEAM';
    userToAdd.team = team._id;
    await userToAdd.save();

    // Notify user
    const io = req.app.get('io');
    await NotificationService.sendNotification(
      io,
      userToAdd._id,
      `You have been added to team "${team.title}"`,
      'MEMBER_ADDED',
      team._id
    );

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      return next(error);
    }

    const memberId = req.params.memberId;

    // Only the leader can remove someone else, or a member can remove themselves
    if (team.leaderId.toString() !== req.user.id && req.user.id !== memberId) {
      const error = new Error('Not authorized to remove this member');
      error.statusCode = 403;
      return next(error);
    }

    // Leader cannot remove themselves via this route (they should transfer leadership or delete team)
    if (team.leaderId.toString() === memberId) {
      const error = new Error('Leader cannot be removed. Transfer leadership or delete the team instead.');
      error.statusCode = 400;
      return next(error);
    }

    const memberIndex = team.members.findIndex(m => m.userId.toString() === memberId);
    if (memberIndex === -1) {
      const error = new Error('Member not found in this team');
      error.statusCode = 404;
      return next(error);
    }

    // Remove member from team
    team.members.splice(memberIndex, 1);
    team.currentSize -= 1;
    await team.save();

    // Update user status
    await User.findByIdAndUpdate(memberId, {
      status: 'LOOKING',
      $unset: { team: "" }
    });

    const io = req.app.get('io');
    if (req.user.id === memberId) {
      // User left
      await NotificationService.sendNotification(
        io,
        team.leaderId,
        `${req.user.name} has left your team`,
        'MEMBER_REMOVED',
        team._id
      );
    } else {
      // Leader removed user
      const removedUser = await User.findById(memberId);
      await NotificationService.sendNotification(
        io,
        memberId,
        `You have been removed from team "${team.title}"`,
        'MEMBER_REMOVED',
        team._id
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Member removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.respondToSwitch = async (req, res, next) => {
  try {
    const { notificationId, decision } = req.body; // decision: 'JOIN' or 'STAY'
    const notification = await Notification.findById(notificationId);

    if (!notification || notification.userId.toString() !== req.user.id) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      return next(error);
    }

    const newTeamId = notification.relatedId;
    const newTeam = await Team.findById(newTeamId);
    
    if (decision === 'JOIN') {
      if (!newTeam || newTeam.currentSize >= newTeam.totalSize) {
        const error = new Error('Target team is full or no longer exists');
        error.statusCode = 400;
        return next(error);
      }

      // 1) Remove from old team
      if (req.user.team) {
        const oldTeam = await Team.findById(req.user.team);
        if (oldTeam) {
          oldTeam.members = oldTeam.members.filter(m => m.userId.toString() !== req.user.id);
          oldTeam.currentSize -= 1;
          await oldTeam.save();
          
          // Notify old leader
          const io = req.app.get('io');
          await NotificationService.sendNotification(
            io,
            oldTeam.leaderId,
            `${req.user.name} has left your team to join another.`,
            'MEMBER_REMOVED',
            oldTeam._id
          );
        }
      }

      // 2) Add to new team
      newTeam.members.push({
        userId: req.user.id,
        role: 'Member',
        joinedAt: Date.now()
      });
      newTeam.currentSize += 1;
      await newTeam.save();

      req.user.team = newTeam._id;
      req.user.status = 'IN_TEAM';
      await req.user.save();

      // 3) Notify new leader
      const io = req.app.get('io');
      await NotificationService.sendNotification(
        io,
        newTeam.leaderId,
        `${req.user.name} accepted your switch request and joined the team!`,
        'TEAM_SWITCH_RESPONSE',
        newTeam._id
      );

      res.status(200).json({
        status: 'success',
        message: 'Successfully joined the new team'
      });
    } else {
      // Stay in current team
      // Notify requesting leader
      if (newTeam) {
        const io = req.app.get('io');
        await NotificationService.sendNotification(
          io,
          newTeam.leaderId,
          `${req.user.name} declined your switch request.`,
          'TEAM_SWITCH_RESPONSE',
          newTeam._id
        );
      }

      res.status(200).json({
        status: 'success',
        message: 'Decision recorded'
      });
    }

    // Mark notification as read
    notification.isRead = true;
    await notification.save();

  } catch (err) {
    next(err);
  }
};
