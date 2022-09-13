const User = require('../../../models/user')

const idToName = ({ id }) => {
  return new Promise((resolve, reject) => {
    User.findById(id, (err, foundUser) => {
      if (err || !foundUser) {
        return reject(err)
      }

      resolve(foundUser.name)
    })
  })
}

const idsToNames = ({ ids }) => {
  return new Promise(async (resolve, reject) => {
    let names = []

    for (const id of ids) {
      const name = await idToName({ id })

      names.push(name)
    }

    resolve(names)
  })
}

module.exports = { idsToNames }
