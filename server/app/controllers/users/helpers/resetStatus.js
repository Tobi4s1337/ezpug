const User = require('../../../models/user')

/**
 * Resets the status for each user to offline
 */
module.exports = () => {
  return new Promise((resolve, reject) => {
    User.updateMany(
      { 'status.online': true },
      { status: { online: false, lastSeen: Date.now(), teamSpeak: false } },
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
