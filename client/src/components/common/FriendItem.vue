<template>
  <v-menu left offset-x close-on-content-click v-model="menuVisible">
    <template v-slot:activator="{ on, attrs }">
      <v-list-item
        v-bind="attrs"
        v-on="on"
        :class="{
          online: status.online,
          offline: !status.online,
          active: status.inQueue || (status.match && status.match.active)
        }"
        class="friend-list-item"
      >
        <v-list-item-avatar rounded size="42" class="mt-0 mb-0 user-avatar">
          <img :src="avatar" />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="user-name">{{ name }}</v-list-item-title>
          <v-list-item-subtitle class="user-status"
            ><UserStatus v-if="!status.hidden" :status="status"
          /></v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>

    <v-list>
      <v-list-item>
        <v-list-item-title>View Profile</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="isFriend">
        <v-list-item-title>Send Message</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="isFriend" @click="removeFriend({ id })">
        <v-list-item-title>Remove friend</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="isSentRequest"
        @click="cancelFriendRequest({ id: requestId })"
      >
        <v-list-item-title>Cancel Friend Request</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="isReceivedRequest"
        @click="updateFriendRequest({ id: requestId, accepted: true })"
      >
        <v-list-item-title>Accept Friend Request</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="isReceivedRequest"
        @click="updateFriendRequest({ id: requestId, accepted: false })"
      >
        <v-list-item-title>Decline Friend Request</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import axios from 'axios'
import { handleError } from '../../utils/utils'
import { getSince } from '@/utils/utils.js'
import { mapActions } from 'vuex'

export default {
  name: 'FriendItem',
  data() {
    return { menuVisible: false }
  },
  props: {
    name: String,
    steamUrl: String,
    id: String,
    avatar: String,
    status: Object,
    elo: Number,
    rank: Number,
    requestId: String,
    type: String // FRIEND, RECEIVED_REQUEST, SENT_REQUEST
  },
  watch: {
    menuVisible: function (oldState, newState) {
      if (oldState === false && newState === true) {
        this.$emit('context-hidden')
      }
      if (oldState === true && newState === false) {
        this.$emit('context-visible')
      }
    }
  },
  computed: {
    isReceivedRequest() {
      return this.type === 'RECEIVED_REQUEST'
    },
    isFriend() {
      return this.type === 'FRIEND'
    },
    isSentRequest() {
      return this.type === 'SENT_REQUEST'
    }
  },
  methods: {
    ...mapActions([
      'cancelFriendRequest',
      'updateFriendRequest',
      'removeFriend'
    ]),
    getSince(date) {
      window.__localeId__ = this.$store.getters.locale
      return getSince(date)
    }
  }
}
</script>

<style scoped lang="scss">
.v-navigation-drawer--mini-variant.v-navigation-drawer--custom-mini-variant
  .v-list-item {
  justify-content: unset;
}
.online {
  .v-list-item__title.user-name,
  .v-list-item__subtitle.user-status {
    color: #57cbde;
  }
  .v-avatar.user-avatar {
    box-shadow: 4px 0px 0 #57cbde;
  }
}
.offline {
  .v-list-item__title.user-name,
  .v-list-item__subtitle.user-status {
    color: #898989;
  }
  .v-avatar.user-avatar {
    box-shadow: 4px 0px 0 #898989;
  }
}
.online.active {
  .v-list-item__title.user-name,
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
.v-list-item__title.user-name {
  font-size: 0.875rem;
}

.v-list-item__subtitle.user-status {
  font-size: 0.775rem;
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
.friend-list-item {
  padding-left: 15px;
  margin-bottom: 10px;
  margin-top: 0px;
  padding-top: 0px;
  padding-bottom: 0px;
  min-height: 50px;

  .v-list-item__avatar:first-child {
    margin-right: 18px;
  }
}
</style>
