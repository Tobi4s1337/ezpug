const User = require('../../../models/user')

/**
 * Resets the status for each user to offline
 */
module.exports = () => {
  return new Promise((resolve, reject) => {
    // TO Do make sure that match active true players get set to false
    User.updateMany(
      { 'status.online': true },
      {
        status: {
          online: false,
          lastSeen: Date.now(),
          teamSpeak: false,
          match: { active: false }
        }
      },
      { multi: true },
      (err, modified) => {
        if (err) {
          reject(err)
        }
        console.log(modified)
        resolve()
      }
    )
  })
}
