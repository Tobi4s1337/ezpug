import axios from 'axios'

export default {
  getDrops(params) {
    return axios.get('/drops', {
      params
    })
  },
  saveDrops(payload) {
    return axios.post('/drops/', payload)
  },
  updateDrop(id, payload) {
    return axios.patch(`/drops/${id}`, payload)
  },
  deleteDrop(id) {
    return axios.delete(`/drops/${id}`)
  }
}
