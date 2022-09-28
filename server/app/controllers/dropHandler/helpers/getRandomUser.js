const User = require('../../../models/user')

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

const getRandomUser = () => {
  return new Promise((resolve, reject) => {
    User.find({ 'status.match.status': 'active' }, (err, users) => {
      if (err || !users || users.length === 0) {
        return reject('No users in match')
      } else {
        const sortedUsers = users.sort(function (a, b) {
          return (a.drops ? a.drops.length : 0) - (b.drops ? b.drops.length : 0)
        })

        for (let i = 0; i < sortedUsers.length; i++) {
          if (getRandomInt(20) > 9) {
            return resolve(sortedUsers[i])
          }

          if (i + 1 === sortedUsers.length) {
            return resolve(sortedUsers[0])
          }
        }
      }
    })
  })
}

module.exports = { getRandomUser }
