const Team = require('../models/teamModel');
const User = require('../models/userModel');

exports.recommendTeams = async (req, res, next) => {
  try {
    const user = req.user;
    
    // 1) Find incomplete teams
    const teams = await Team.find({ 
      status: 'INCOMPLETE',
      isPrivate: false,
      leaderId: { $ne: user.id }
    });

    // 2) Score teams
    const scoredTeams = teams.map(team => {
      let score = 0;
      
      // Matching tracks (+5 per match)
      const matchingTracks = team.requiredTracks.filter(rt => 
        user.tracks.includes(rt.track) && rt.neededCount > 0
      );
      score += matchingTracks.length * 5;

      // Skill similarity (+2 per match)
      // This is a simple implementation, ideally we'd use a more complex algorithm
      const teamDescription = team.description.toLowerCase();
      const matchingSkills = user.skills.filter(skill => 
        teamDescription.includes(skill.toLowerCase())
      );
      score += matchingSkills.length * 2;

      // Team availability penalty (nearly full teams might be more competitive or less likely to accept)
      const vacancy = team.totalSize - team.currentSize;
      if (vacancy === 1) score -= 2;

      return {
        team,
        score
      };
    });

    // 3) Sort by score
    scoredTeams.sort((a, b) => b.score - a.score);

    res.status(200).json({
      status: 'success',
      data: {
        recommendations: scoredTeams.filter(st => st.score > 0)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.recommendTeammates = async (req, res, next) => {
  try {
    const { teamId } = req.query;
    if (!teamId) {
      const error = new Error('Please provide a teamId');
      error.statusCode = 400;
      return next(error);
    }

    const team = await Team.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      return next(error);
    }

    // 1) Find users looking for teams
    const users = await User.find({ 
      status: 'LOOKING',
      _id: { $ne: req.user.id }
    });

    // 2) Score users
    const scoredUsers = users.map(user => {
      let score = 0;

      // Matching tracks (+5 per match)
      const teamTracks = team.requiredTracks.filter(rt => rt.neededCount > 0).map(rt => rt.track);
      const matchingTracks = user.tracks.filter(track => teamTracks.includes(track));
      score += matchingTracks.length * 5;

      // Skill similarity (+2 per match)
      const teamDescription = team.description.toLowerCase();
      const matchingSkills = user.skills.filter(skill => 
        teamDescription.includes(skill.toLowerCase())
      );
      score += matchingSkills.length * 2;

      return {
        user,
        score
      };
    });

    // 3) Sort by score
    scoredUsers.sort((a, b) => b.score - a.score);

    res.status(200).json({
      status: 'success',
      data: {
        recommendations: scoredUsers.filter(su => su.score > 0)
      }
    });
  } catch (err) {
    next(err);
  }
};
