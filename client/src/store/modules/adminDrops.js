import * as types from '@/store/mutation-types'
import api from '@/services/api/adminDrops'
import { buildSuccess, handleError } from '@/utils/utils.js'

const getters = {
  drops: (state) => state.drops,
  totalDrops: (state) => state.totalDrops
}

const actions = {
  getDrops({ commit }, payload) {
    return new Promise((resolve, reject) => {
      api
        .getDrops(payload)
        .then((response) => {
          if (response.status === 200) {
            commit(types.DROPS, response.data.docs)
            commit(types.TOTAL_DROPS, response.data.totalDocs)
            resolve()
          }
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  },
  saveDrops({ commit }, payload) {
    return new Promise((resolve, reject) => {
      api
        .saveDrops(payload)
        .then((response) => {
          if (response.status === 201) {
            buildSuccess(
              {
                msg: 'common.SAVED_SUCCESSFULLY'
              },
              commit,
              resolve
            )
          }
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  },
  updateDrop({ commit }, payload) {
    return new Promise((resolve, reject) => {
      const data = {
        redeemed: payload.redeemed
      }
      api
        .updateDrop(payload._id, data)
        .then((response) => {
          if (response.status === 200) {
            buildSuccess(
              {
                msg: 'common.SAVED_SUCCESSFULLY'
              },
              commit,
              resolve
            )
          }
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  },
  deleteDrop({ commit }, payload) {
    return new Promise((resolve, reject) => {
      api
        .deleteDrop(payload)
        .then((response) => {
          if (response.status === 200) {
            buildSuccess(
              {
                msg: 'common.DELETED_SUCCESSFULLY'
              },
              commit,
              resolve
            )
          }
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  }
}

const mutations = {
  [types.DROPS](state, drops) {
    state.drops = drops
  },
  [types.TOTAL_DROPS](state, value) {
    state.totalDrops = value
  }
}

const state = {
  drops: [],
  totalDrops: 0
}

export default {
  state,
  getters,
  actions,
  mutations
}
