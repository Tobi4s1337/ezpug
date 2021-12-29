import axios from 'axios'

export default {
  getFriends() {
    return axios.get('/friends')
  },
  getFriendRequests() {
    return axios.get('/friends/requests')
  },
  createFriendRequest(payload) {
    return axios.post('/friends', payload)
  },
  removeFriend(id) {
    return axios.delete(`/friends/existing/${id}`)
  },
  cancelFriendRequest(id) {
    return axios.delete(`/friends/${id}`)
  },
  updateFriendRequest(id, payload) {
    return axios.patch(`/friends/${id}`, payload)
  }
}
