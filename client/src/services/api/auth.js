import axios from 'axios'

export default {
  userLogin(payload) {
    if (payload && payload.steamId) {
      return axios.post('/steam/login', payload)
    }
    return axios.post('/login', payload)
  },
  refreshToken() {
    return axios.get('/token')
  }
}
