import * as types from '@/store/mutation-types'
import api from '@/services/api/friends'
import { buildSuccess, handleError } from '@/utils/utils.js'
import Vue from 'vue'

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
  },
  socket_socialChangedName({ commit }, payload) {
    commit(types.UPDATE_FRIEND, payload)
  },
  socket_socialChangedStatus({ commit }, payload) {
    commit(types.UPDATE_FRIEND, payload)
  },
  socket_privateNewReceivedFriendRequest({ commit }, payload) {
    commit(types.ADD_SENT_RECEIVED_REQUEST, payload)
  },
  socket_privateNewRequestedFriendRequest({ commit }, payload) {
    commit(types.ADD_SENT_FRIEND_REQUEST, payload)
  },
  socket_privateDeleteReceivedFriendRequest({ commit }, payload) {
    commit(types.REMOVE_RECEIVED_FRIEND_REQUEST, payload.id)
  },
  socket_privateDeleteRequestedFriendRequest({ commit }, payload) {
    commit(types.REMOVE_SENT_FRIEND_REQUEST, payload.id)
  },
  socket_privateNewFriend({ commit }, payload) {
    commit(types.ADD_FRIEND, payload)
  },
  socket_privateDeleteFriend({ commit }, payload) {
    commit(types.REMOVE_FRIEND, payload.id)
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
    if (state.sentFriendRequests.some((e) => e._id === friendRequest._id)) {
      return
    }
    state.sentFriendRequests.push(friendRequest)
  },
  [types.ADD_SENT_RECEIVED_REQUEST](state, friendRequest) {
    state.receivedFriendRequests.push(friendRequest)
  },
  [types.REMOVE_SENT_FRIEND_REQUEST](state, friendRequestId) {
    state.sentFriendRequests = state.sentFriendRequests.filter((request) => {
      return request._id !== friendRequestId
    })
  },
  [types.REMOVE_RECEIVED_FRIEND_REQUEST](state, friendRequestId) {
    state.receivedFriendRequests = state.receivedFriendRequests.filter(
      (request) => {
        return request._id !== friendRequestId
      }
    )
  },
  [types.REMOVE_FRIEND](state, userId) {
    state.friends = state.friends.filter((friend) => {
      return friend._id !== userId
    })
    this._vm.$socket.client.emit('leave-social', friend._id)
  },
  [types.ADD_FRIEND](state, friend) {
    if (state.friends.some((e) => e._id === friend._id)) {
      return
    }
    state.friends.push(friend)
    this._vm.$socket.client.emit('join-social', friend._id)
  },
  [types.UPDATE_FRIEND](state, data) {
    const index = state.friends.map((e) => e._id).indexOf(data.userId)
    delete data.userId

    if (state.friends[index] && data) {
      const friend = Object.assign(state.friends[index], data)
      Vue.set(state.friends, index, Object.assign(state.friends[index], friend))
    }
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
