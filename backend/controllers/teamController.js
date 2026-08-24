const Team = require('../models/Team');
const Event = require('../models/Event');

exports.verifyTeamCode = async (req, res, next) => {
  try {
    const { teamCode } = req.params;
    const { eventSlug } = req.query; // Ensure the team is for the correct event

    const team = await Team.findOne({ teamCode: teamCode.toUpperCase() })
      .populate('leader', 'fullName email')
      .populate('members', 'fullName email')
      .populate('event', 'name slug isTeamEvent maxTeamSize');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Invalid Team Code. Team not found.' });
    }

    if (eventSlug && team.event.slug !== eventSlug) {
      return res.status(400).json({ success: false, message: `This team code is for a different event (${team.event.name}).` });
    }

    if (team.members.length >= team.event.maxTeamSize) {
      return res.status(400).json({ success: false, message: 'This team has already reached its maximum capacity.' });
    }

    res.json({
      success: true,
      data: {
        teamName: team.teamName,
        teamCode: team.teamCode,
        eventName: team.event.name,
        leader: team.leader.fullName,
        memberCount: team.members.length,
        maxSize: team.event.maxTeamSize,
        members: team.members.map(m => m.fullName)
      }
    });
  } catch (err) {
    next(err);
  }
};
