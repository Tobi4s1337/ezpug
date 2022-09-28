const axios = require('axios')
const PROJECTOR_WEBHOOK_ENDPOINT = 'https://projector.ezpug.com/'

const projectorAnnounce = ({ dropName, username, dropImage }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios.post(PROJECTOR_WEBHOOK_ENDPOINT, {
        dropName,
        username,
        dropImage
      })

      resolve()
    } catch (err) {
      console.log(err)
      resolve(err)
    }
  })
}

module.exports = { projectorAnnounce }
