const User = require('../../models/user')
const TeamSpeakHandler = require('../teamSpeak')

const generateCode = () => {
  return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)
}

const setUserCode = (userId, code) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      userId,
      { $set: { teamSpeakCode: code } },
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
const linkTeamSpeakRequest = async (req, res) => {
  try {
    const teamSpeakHandler = await TeamSpeakHandler.getInstance()
    const userId = req.user._id
    const code = generateCode()

    await setUserCode(userId, code)

    teamSpeakHandler.messageById({
      id: req.body.teamSpeakId,
      message: `Bitte gebe den folgenden Code auf der EZPUG Website ein um deine TeamSpeak-Identität zu verlinken: ${code}`
    })

    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

module.exports = { linkTeamSpeakRequest }
