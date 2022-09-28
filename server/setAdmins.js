const User = require('./app/models/user')

const adminIds = ['6327885a20a8736a79fdbd03']

const setAdmins = () => {
  return new Promise(async (resolve, reject) => {
    for (const admin of adminIds) {
      User.findByIdAndUpdate(
        admin,
        { $set: { role: 'admin' } },
        (err, updatedUser) => {
          if (err || !updatedUser) {
            console.log('Error setting admin for user with id', admin)
          } else {
            console.log('Updated user to admin with ID', admin)
          }
        }
      )
    }
    resolve()
  })
}

module.exports = { setAdmins }
