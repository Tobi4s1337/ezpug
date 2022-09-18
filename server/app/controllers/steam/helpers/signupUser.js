const {
  registerUser,
  setUserInfo
} = require('../../../controllers/auth/helpers')
const { addSteamToUser } = require('./addSteamToUser')

const signupUser = (steamId) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('test')
      const item = await registerUser({ steamId })
      console.log(item)
      const steamUserData = await addSteamToUser(item._id, steamId)
      const userInfo = await setUserInfo(item)

      resolve(item)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { signupUser }
