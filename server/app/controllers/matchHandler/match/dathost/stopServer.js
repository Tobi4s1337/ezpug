const { getAxiosInstance } = require('./getAxiosInstance')

const stopServer = ({ serverId }) => {
  return new Promise(async (resolve, reject) => {
    const axios = getAxiosInstance()

    try {
      const { data } = await axios.post(`/game-servers/${serverId}/stop`)
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { stopServer }
