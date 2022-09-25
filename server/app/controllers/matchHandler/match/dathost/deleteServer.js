const { getAxiosInstance } = require('./getAxiosInstance')

const deleteServer = ({ serverId }) => {
  return new Promise(async (resolve, reject) => {
    const axios = getAxiosInstance()

    try {
      const { data } = await axios.delete(`/game-servers/${serverId}`)
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { deleteServer }
