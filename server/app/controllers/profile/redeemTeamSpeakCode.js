const User = require('../../models/user')
const { updateStatus } = require('../users/helpers/updateStatus')

const getUserCode = (userId) => {
  return new Promise((resolve, reject) => {
    User.findById(userId, (err, foundUser) => {
      if (err || !foundUser) {
        return reject(err)
      }

      resolve(foundUser.teamSpeakCode)
    })
  })
}

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
const redeemTeamSpeakCode = async (req, res) => {
  try {
    const userId = req.user._id
    const code = req.body.code

    const teamSpeakCode = await getUserCode(userId)

    if (teamSpeakCode === code) {
      await setTeamSpeakId(userId, req.body.teamSpeakId)
      await updateStatus(userId, { teamSpeak: true })
      return res.json({ success: true })
    }

    res.json({ success: false })
  } catch (error) {
    console.log('Error redeeming teamspeak code', error)
    res.json({ success: false })
  }
}

module.exports = { redeemTeamSpeakCode }
