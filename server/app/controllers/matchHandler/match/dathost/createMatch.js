const { getAxiosInstance } = require('./getAxiosInstance')

const createMatch = ({ config }) => {
  return new Promise(async (resolve, reject) => {
    const axios = getAxiosInstance()

    try {
      const { data } = await axios.post('/matches', new URLSearchParams(config))

      console.log(data)
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { createMatch }
