<template>
  <v-card outlined dark elevation="1" color="background">
    <v-list-item
      three-line
      class="text-left player-wrapper"
      :class="{ small: small }"
    >
      <v-list-item-content>
        <v-list-item-title class="player-name">
          {{ name }} #{{ rank }} {{ captain ? '👑' : '' }}
        </v-list-item-title>
        <v-list-item-subtitle class="user-status"> </v-list-item-subtitle>
        <div class="user-stats">
          <div class="user-results-wrapper">
            <div class="user-rank-title">{{ $t('stats.RECENT_RESULTS') }}</div>
            <div class="user-rank">
              <span class="win-letter">W</span>
              <span class="lose-letter">L</span>
              <span class="win-letter">W</span>
              <span class="win-letter">W</span>
              <span class="win-letter">W</span>
            </div>
          </div>
          <div class="user-elo-wrapper">
            <div class="user-elo-title">{{ $t('stats.ELO_RATING') }}</div>
            <div class="user-elo">2045</div>
          </div>
        </div>
      </v-list-item-content>
      <v-list-item-avatar size="64" color="grey" class="user-avatar" rounded>
        <img :src="avatar" :alt="name"
      /></v-list-item-avatar>
    </v-list-item>

    <v-divider v-if="!small"></v-divider>

    <v-card-actions class="user-actions" v-if="!small">
      <v-btn color="white" icon :href="steamUrl" target="_blank"
        ><v-icon dark> mdi-steam </v-icon></v-btn
      >
      <v-btn color="white" icon :href="steamUrl" target="_blank">
        <v-icon dark> mdi-account-circle </v-icon></v-btn
      >
      <v-btn
        v-if="!isFriend && !isReceivedRequest && !isSentRequest && !isUser"
        color="white"
        icon
        @click="createFriendRequest({ recipient: id })"
        target="_blank"
      >
        <v-icon dark> mdi-account-plus </v-icon></v-btn
      >
      <v-btn v-if="isFriend" target="_blank">
        <v-icon dark> mdi-account-plus </v-icon></v-btn
      >
      <v-btn
        v-if="isReceivedRequest"
        color="white"
        icon
        target="_blank"
        @click="updateFriendRequest({ id: friendRequest._id, accepted: true })"
      >
        <v-icon dark> mdi-account-plus </v-icon></v-btn
      >
      <v-btn
        v-if="isSentRequest"
        color="white"
        icon
        target="_blank"
        @click="cancelFriendRequest({ id: friendRequest._id })"
      >
        <v-icon dark> mdi-account-plus </v-icon></v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from 'axios'
import { handleError } from '../../utils/utils'
import { getSince } from '@/utils/utils.js'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PlayerCard',
  data() {
    return {}
  },
  props: {
    name: String,
    steamUrl: String,
    id: String,
    avatar: String,
    elo: Number,
    rank: Number,
    captain: Boolean,
    small: Boolean
  },
  computed: {
    ...mapGetters([
      'friends',
      'sentFriendRequests',
      'receivedFriendRequests',
      'user'
    ]),
    isUser() {
      return this.id === this.user._id
    },
    isFriend() {
      return this.friends.some((friend) => friend['_id'] === this.id)
    },
    isReceivedRequest() {
      return this.receivedFriendRequests.some(
        (receivedRequest) => receivedRequest.requester['_id'] === this.id
      )
    },
    isSentRequest() {
      return this.sentFriendRequests.some(
        (sentRequest) => sentRequest.recipient['_id'] === this.id
      )
    },
    friendRequest() {
      if (!this.isReceivedRequest && !this.isSentRequest) {
        return null
      }
      if (this.isReceivedRequest) {
        return this.receivedFriendRequests.filter((request) => {
          return request.requester._id === this.id
        })[0]
      }
      if (this.isSentRequest) {
        return this.sentFriendRequests.filter((request) => {
          return request.recipient._id === this.id
        })[0]
      }
    },
    statusText() {
      if (this.status.online) {
        if (this.status.inQueue) {
          return this.$t('status.IN_QUEUE')
        }
        if (this.status.inMatch) {
          return this.$t('status.IN_MATCH')
        }
        return this.$t('status.ONLINE')
      }
      return this.$t('status.LAST_SEEN') + ' ' + this.getSince(status.lastSeen)
    }
  },
  methods: {
    ...mapActions([
      'createFriendRequest',
      'cancelFriendRequest',
      'updateFriendRequest'
    ]),
    getSince(date) {
      window.__localeId__ = this.$store.getters.locale
      return getSince(date)
    }
  }
}
</script>

<style scoped lang="scss">
.online {
  .v-list-item__subtitle.user-status {
    overflow: visible;
    color: #57cbde;
  }
  .v-avatar.user-avatar {
    box-shadow: 4px 0px 0 #57cbde;
  }
}
.offline {
  .v-list-item__subtitle.user-status {
    overflow: visible;
    color: #898989;
  }
  .v-avatar.user-avatar {
    box-shadow: 4px 0px 0 #898989;
  }
}
.online.active {
  .v-list-item__subtitle.user-status {
    overflow: visible;
    color: #90ba3c;
  }
  .v-avatar.user-avatar {
    box-shadow: 4px 0px 0 #90ba3c;
  }
}
.user-actions {
  justify-content: flex-start;
  padding-top: 4px;
  padding-bottom: 4px;
}
.v-list-item__subtitle.user-status {
  font-size: 1.175rem;
}

.user-stats {
  display: flex;
  justify-content: start;

  .user-elo-title,
  .user-rank-title {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .user-elo-wrapper {
    padding-left: 14px;
  }

  .user-rank {
    span {
      margin-right: 8px;

      &.lose-letter {
        color: #ca3e3f;
      }
      &.win-letter {
        color: #90ba3c;
      }
    }
  }
}
.v-list-item {
  padding: 0 16px 0px 12px;
}
.player-name {
  letter-spacing: 0.02em;
  font-size: 20px;
  font-weight: bold;
  line-height: 22px;
}
.user-avatar {
  margin-top: 12px !important;
  margin-bottom: 12px !important;
}
.player-wrapper {
  padding: 0 12px 0px 12px;
  &.small {
    min-height: 78px;
    max-height: 78px;
    .v-list-item__content {
      padding: 8px 0;
    }
    .user-avatar {
      margin-top: 8px !important;
      margin-bottom: 8px !important;
    }
  }
}
</style>
