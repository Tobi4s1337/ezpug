const User = require('../../../models/user')

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

const idsToProfiles = ({ ids }) => {
  return new Promise(async (resolve, reject) => {
    let profiles = []

    for (const id of ids) {
      const { name, avatar } = await idToProfile({ id })

      profiles.push({ name, avatar, userId: id })
    }

    resolve(profiles)
  })
}

module.exports = { idsToProfiles }
