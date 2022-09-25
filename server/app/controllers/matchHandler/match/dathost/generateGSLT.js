const axios = require('axios')
const STEAM_API_KEY = process.env.STEAM_API_KEY || '1337'

const generateGSLT = ({ matchId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.post(
        `https://api.steampowered.com/IGameServersService/CreateAccount/v1/?key=${STEAM_API_KEY}&appid=730&memo=${matchId}`
      )

      if (data && data.response && data.response.login_token) {
        return resolve(data.response.login_token)
      }

      reject('Failed to get GSLT', data)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { generateGSLT }
