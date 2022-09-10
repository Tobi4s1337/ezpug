const User = require('../../models/user')
const { updateStatus } = require('../users/helpers/updateStatus')

const setTeamSpeakId = (userId, teamSpeakId) => {
  return new Promise((resolve, reject) => {
    console.log('Link', teamSpeakId)
    User.findByIdAndUpdate(
      userId,
      { $set: { teamSpeakId } },
      (err, updatedUser) => {
        if (err) {
          return reject(err)
        }
        resolve(updatedUser)
      }
    )
  })
}

/**
 * Get all current teamspeak users
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const unlinkTeamSpeak = async (req, res) => {
  try {
    const userId = req.user._id

    await setTeamSpeakId(userId, '')
    await updateStatus(userId, { teamSpeak: false })

    res.sendStatus(200)
  } catch (error) {
    console.log('Error unlinking teamspeak', error)
    res.sendStatus(500)
  }
}

module.exports = { unlinkTeamSpeak }
