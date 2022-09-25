const { getAxiosInstance } = require('./getAxiosInstance')

const cloneServer = ({ serverId }) => {
  return new Promise(async (resolve, reject) => {
    const axios = getAxiosInstance()

    try {
      const { data } = await axios.post(`/game-servers/${serverId}/duplicate`)

      console.log(data)
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { cloneServer }
