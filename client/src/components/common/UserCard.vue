<template>
  <v-card
    max-width="400"
    outlined
    elevation="5"
    :class="{
      online: status.online,
      offline: !status.online,
      active: status.inQueue || status.inMatch
    }"
  >
    <v-list-item three-line class="text-left">
      <v-list-item-content>
        <v-list-item-title class="headline">
          {{ name }} #{{ rank }}
        </v-list-item-title>
        <v-list-item-subtitle class="user-status"
          ><UserStatus :status="status"
        /></v-list-item-subtitle>
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
      <v-list-item-avatar size="86" color="grey" class="user-avatar" rounded>
        <img
          src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/9c/9c2082f9ed437afa5b921455379b2091afeb5974_full.jpg"
          :alt="name"
      /></v-list-item-avatar>
    </v-list-item>

    <v-card-actions class="user-actions">
      <v-btn outlined text :href="steamUrl" target="_blank"
        >Steam <v-icon right dark> mdi-steam </v-icon></v-btn
      >
      <v-btn outlined text :href="steamUrl" target="_blank"
        >{{ $t('social.PROFILE') }}
        <v-icon right dark> mdi-account-circle </v-icon></v-btn
      >
      <v-btn
        v-if="!isFriend && !isReceivedRequest && !isSentRequest"
        outlined
        text
        @click="createFriendRequest({ recipient: id })"
        target="_blank"
        >{{ $t('social.ADD_FRIEND') }}
        <v-icon right dark> mdi-account-plus </v-icon></v-btn
      >
      <v-btn v-if="isFriend" outlined text target="_blank"
        >{{ $t('social.SEND_MESSAGE') }}
        <v-icon right dark> mdi-account-plus </v-icon></v-btn
      >
      <v-btn
        v-if="isReceivedRequest"
        outlined
        text
        target="_blank"
        @click="updateFriendRequest({ id: friendRequest._id, accepted: true })"
        >{{ $t('social.ACCEPT_REQUEST') }}
        <v-icon right dark> mdi-account-plus </v-icon></v-btn
      >
      <v-btn
        v-if="isSentRequest"
        outlined
        text
        target="_blank"
        @click="cancelFriendRequest({ id: friendRequest._id })"
        >{{ $t('social.CANCEL_REQUEST') }}
        <v-icon right dark> mdi-account-plus </v-icon></v-btn
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
  name: 'UserCard',
  data() {
    return {}
  },
  props: {
    name: String,
    steamUrl: String,
    id: String,
    avatar: String,
    status: Object,
    elo: Number,
    rank: Number
  },
  computed: {
    ...mapGetters(['friends', 'sentFriendRequests', 'receivedFriendRequests']),
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
    color: #57cbde;
  }
  .v-avatar.user-avatar {
    box-shadow: 4px 0px 0 #57cbde;
  }
}
.offline {
  .v-list-item__subtitle.user-status {
    color: #898989;
  }
  .v-avatar.user-avatar {
    box-shadow: 4px 0px 0 #898989;
  }
}
.online.active {
  .v-list-item__subtitle.user-status {
    color: #90ba3c;
  }
  .v-avatar.user-avatar {
    box-shadow: 4px 0px 0 #90ba3c;
  }
}
.user-actions {
  justify-content: space-around;
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
.v-card__actions.user-actions {
  padding-top: 0px;
}
.v-list-item {
  padding: 0 16px 0px 12px;
}
</style>
