const TeamSpeakHandler = require('./app/controllers/teamSpeak')
const User = require('./app/models/user')
const { updateStatus } = require('./app/controllers/users/helpers/updateStatus')

const initTeamSpeak = async () => {
  try {
    const teamSpeakHandler = await TeamSpeakHandler.getInstance()

    teamSpeakHandler.on('user-connect', (teamSpeakId) => {
      console.log('Wow po')
      User.findOne({ teamSpeakId }, (err, foundUser) => {
        if (err || !foundUser) {
          return
        }

        updateStatus(foundUser._id, { teamSpeak: true })
      })
    })

    teamSpeakHandler.on('user-disconnect', (teamSpeakId) => {
      User.findOne({ teamSpeakId }, (err, foundUser) => {
        if (err || !foundUser) {
          return
        }

        updateStatus(foundUser._id, { teamSpeak: false })
      })
    })
  } catch (err) {
    console.log('Error initiating TeamSpeak', err)
  }
}

module.exports = initTeamSpeak
