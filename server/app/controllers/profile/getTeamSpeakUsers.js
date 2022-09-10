const TeamSpeakHandler = require('../teamSpeak')

/**
 * Get all current teamspeak users
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getTeamSpeakUsers = async (req, res) => {
  try {
    const teamSpeakHandler = await TeamSpeakHandler.getInstance()

    const users = await teamSpeakHandler.getUnlinkedUsers()

    res.json(users)
  } catch (error) {
    console.log(error)
    res.json([])
  }
}

module.exports = { getTeamSpeakUsers }
