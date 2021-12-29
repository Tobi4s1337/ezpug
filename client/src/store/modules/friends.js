import * as types from '@/store/mutation-types'
import api from '@/services/api/friends'
import { buildSuccess, handleError } from '@/utils/utils.js'

const getters = {
  friends: (state) => state.friends,
  sentFriendRequests: (state) => state.sentFriendRequests,
  receivedFriendRequests: (state) => state.receivedFriendRequests
}

const actions = {
  getFriendRequests({ commit }, payload) {
    return new Promise((resolve, reject) => {
      api
        .getFriendRequests(payload)
        .then((response) => {
          if (response.status === 200) {
            commit(
              types.RECEIVED_FRIEND_REQUESTS,
              response.data.receivedFriendRequests
            )
            commit(types.SENT_FRIEND_REQUESTS, response.data.sentFriendRequests)
            resolve()
          }
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  },
  getFriends({ commit }, payload) {
    return new Promise((resolve, reject) => {
      api
        .getFriends(payload)
        .then((response) => {
          if (response.status === 200) {
            commit(types.FRIENDS, response.data)
            resolve()
          }
        })
        .catch((error) => {
          handleError(error, commit, reject)
        })
    })
  },
  createFriendRequest({ commit }, payload) {
    return new Promise((resolve, reject) => {
      api
        .createFriendRequest(payload)
        .then((response) => {
          if (response.status === 200) {
            commit(types.ADD_SENT_FRIEND_REQUEST, response.data)
            buildSuccess(
              {
                msg: 'social.REQUEST_SENT'
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
  updateFriendRequest({ commit, dispatch }, payload) {
    return new Promise((resolve, reject) => {
      const data = {
        accepted: payload.accepted
      }
      api
        .updateFriendRequest(payload.id, data)
        .then((response) => {
          if (response.status === 200) {
            commit(types.REMOVE_RECEIVED_FRIEND_REQUEST, payload.id)
            dispatch('getFriends')
            buildSuccess(
              {
                msg: response.msg
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
  removeFriend({ commit }, payload) {
    return new Promise((resolve, reject) => {
      api
        .removeFriend(payload.id)
        .then((response) => {
          if (response.status === 200) {
            commit(types.REMOVE_FRIEND, payload.id)
            buildSuccess(
              {
                msg: 'social.REMOVED_SUCCESSFULLY'
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
  cancelFriendRequest({ commit }, payload) {
    return new Promise((resolve, reject) => {
      api
        .cancelFriendRequest(payload.id)
        .then((response) => {
          if (response.status === 200) {
            commit(types.REMOVE_SENT_FRIEND_REQUEST, payload.id)
            buildSuccess(
              {
                msg: 'social.CANCELLED_SUCCESSFULLY'
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
  [types.FRIENDS](state, friends) {
    state.friends = friends
  },
  [types.SENT_FRIEND_REQUESTS](state, sentFriendRequests) {
    state.sentFriendRequests = sentFriendRequests
  },
  [types.RECEIVED_FRIEND_REQUESTS](state, receivedFriendRequests) {
    state.receivedFriendRequests = receivedFriendRequests
  },
  [types.ADD_SENT_FRIEND_REQUEST](state, friendRequest) {
    state.sentFriendRequests.push(friendRequest)
  },
  [types.REMOVE_SENT_FRIEND_REQUEST](state, friendRequestId) {
    state.sentFriendRequests = state.sentFriendRequests.filter((request) => {
      return request._id !== friendRequestId
    })
  },
  [types.REMOVE_RECEIVED_FRIEND_REQUEST](state, friendRequestId) {
    state.receivedFriendRequests = state.receivedFriendRequests.filter((request) => {
      return request._id !== friendRequestId
    })
  },
  [types.REMOVE_FRIEND](state, userId) {
    state.friends = state.friends.filter((friend) => {
      return friend._id !== userId
    })
  }
}

const state = {
  friends: [],
  sentFriendRequests: [],
  receivedFriendRequests: []
}

export default {
  state,
  getters,
  actions,
  mutations
}
