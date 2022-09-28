const { getAxiosInstance } = require('./getAxiosInstance')
const util = require('util')
const stream = require('stream')
const pipeline = util.promisify(stream.pipeline)
const fs = require('fs')

const downloadDemo = ({ matchId, serverId, dathostMatchId }) => {
  return new Promise(async (resolve, reject) => {
    const axios = getAxiosInstance()

    try {
      const request = await axios.get(
        `/game-servers/${serverId}/files/${dathostMatchId}.dem`,
        {
          responseType: 'stream'
        }
      )
      await pipeline(
        request.data,
        fs.createWriteStream(`./public/demos/${matchId}.dem`)
      )

      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { downloadDemo }
