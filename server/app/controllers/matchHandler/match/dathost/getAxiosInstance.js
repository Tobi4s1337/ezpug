const axios = require('axios')
const DATHOST_USERNAME = process.env.DATHOST_USERNAME || '1337'
const DATHOST_PASSWORD = process.env.DATHOST_PASSWORD || '1337'

const getAxiosInstance = () => {
  const headers = {
    authorization: `Basic ${Buffer.from(
      `${DATHOST_USERNAME}:${DATHOST_PASSWORD}`
    ).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  const instance = axios.create({
    baseURL: 'https://dathost.net/api/0.1',
    headers
  })

  return instance
}

module.exports = { getAxiosInstance }
