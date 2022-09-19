const User = require('../../../../models/user')

const idToProfile = ({ id }) => {
  return new Promise((resolve, reject) => {
    User.findById(id, (err, foundUser) => {
      if (err || !foundUser) {
        return reject(err)
      }

      resolve({ name: foundUser.name, avatar: foundUser.avatar })
    })
  })
}

module.exports = { idToProfile }
