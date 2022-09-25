const { getAxiosInstance } = require('./getAxiosInstance')

const updateServer = ({ serverId, data }) => {
  return new Promise(async (resolve, reject) => {
    const axios = getAxiosInstance()

    try {
      const res = await axios.put(
        `/game-servers/${serverId}`,
        new URLSearchParams(data)
      )

      console.log(res.data)
      resolve(res)
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}

module.exports = { updateServer }
