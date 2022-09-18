<template>
  <v-navigation-drawer
    right
    permanent
    absolute
    mini-variant-width="78"
    class="text-left friendlist"
    stateless="true"
    :mini-variant="collapsed"
    @mouseover.native="hover = true"
    @mouseleave.native="hover = false"
  >
    <v-list dense nav class="py-0">
      <v-list-item two-line class="py-0 user-item online mt-1 mb-1">
        <v-list-item-avatar rounded size="54" class="mb-0 mt-0 user-avatar">
          <img :src="profile.avatar" />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="user-name">{{
            user.name
          }}</v-list-item-title>
          <v-list-item-subtitle class="user-status"
            ><UserStatus :status="user.status"
          /></v-list-item-subtitle>
          <v-list-item-subtitle class="user-stats"
            ><span class="user-rank mr-2">Rank: 13</span
            ><span class="user-elo">Elo: 2044</span>
            <v-btn small icon class="user-settings" to="/profile"
              ><v-icon small> mdi-cog </v-icon></v-btn
            ></v-list-item-subtitle
          >
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-tabs v-model="selectedList" grow class="friends-list-actions">
      <v-tab><v-icon>mdi-account-group</v-icon></v-tab>
      <v-tab><v-icon>mdi-email-outline</v-icon></v-tab>
      <v-tab><v-icon>mdi-magnify</v-icon></v-tab>
      <v-layout @click="addFriends()" class="add-friends-button"
        ><v-icon color="rgba(255, 255, 255, 0.6)"
          >mdi-account-plus</v-icon
        ></v-layout
      >
    </v-tabs>
    <v-divider></v-divider>
    <v-tabs-items v-model="selectedList" class="friendlist-content">
      <v-tab-item>
        <v-list
          dense
          class="overflow-y-auto px-0"
          style="max-height: calc(100% - 120px); scrollbar-width: none"
        >
          <v-list class="online-list">
            <v-subheader class="friendlist-subheader"
              ><v-icon left color="#90ba3c">mdi-access-point</v-icon>Freunde
              Online ({{ onlineFriends.length }})</v-subheader
            >
            <FriendItem
              v-for="friend in onlineFriends"
              :key="friend._id"
              type="FRIEND"
              @context-visible="contextMenuOpen = true"
              @context-hidden="contextMenuOpen = false"
              :name="friend.name"
              :avatar="friend.avatar"
              steam-url="props.item.steamUrl"
              :id="friend._id"
              rank="32"
              elo="1337"
              :status="friend.status"
            />
          </v-list>
          <v-list class="offline-list" dense>
            <v-divider></v-divider>
            <v-subheader class="friendlist-subheader"
              ><v-icon left color="grey">mdi-access-point-remove</v-icon>Freunde
              Offline ({{ offlineFriends.length }})</v-subheader
            >
            <FriendItem
              v-for="friend in offlineFriends"
              :key="friend._id"
              :name="friend.name"
              type="FRIEND"
              @context-visible="contextMenuOpen = true"
              @context-hidden="contextMenuOpen = false"
              :avatar="friend.avatar"
              steam-url="props.item.steamUrl"
              :id="friend._id"
              rank="32"
              elo="1337"
              :status="friend.status"
            />
          </v-list>
        </v-list>
      </v-tab-item>
      <v-tab-item>
        <v-list
          dense
          class="overflow-y-auto px-0"
          style="max-height: calc(100% - 120px); scrollbar-width: none"
        >
          <v-list class="online-list">
            <v-subheader class="friendlist-subheader"
              ><v-icon left color="#90ba3c">mdi-access-point</v-icon>Received
              friend requests ({{ receivedFriendRequests.length }})</v-subheader
            >
            <FriendItem
              v-for="request in receivedFriendRequests"
              type="RECEIVED_REQUEST"
              :request-id="request._id"
              :key="request.requester._id"
              :name="request.requester.name"
              @context-visible="contextMenuOpen = true"
              @context-hidden="contextMenuOpen = false"
              :avatar="request.requester.avatar"
              steam-url="props.item.steamUrl"
              :id="request.requester._id"
              rank="32"
              elo="1337"
              :status="{ hidden: true }"
            />
          </v-list>
          <v-list class="offline-list" dense>
            <v-divider></v-divider>
            <v-subheader class="friendlist-subheader"
              ><v-icon left color="grey">mdi-access-point-remove</v-icon>Sent
              friend requests ({{ sentFriendRequests.length }})</v-subheader
            >
            <FriendItem
              v-for="request in sentFriendRequests"
              :key="request.recipient._id"
              type="SENT_REQUEST"
              :request-id="request._id"
              :name="request.recipient.name"
              @context-visible="contextMenuOpen = true"
              @context-hidden="contextMenuOpen = false"
              :avatar="friend.recipient.avatar"
              :id="request.recipient._id"
              rank="32"
              elo="1337"
              :status="{ hidden: true }"
            />
          </v-list>
        </v-list>
      </v-tab-item>
      <v-tab-item>
        <v-list
          dense
          class="overflow-y-auto px-0"
          style="max-height: calc(100% - 120px); scrollbar-width: none"
        >
          <v-list class="search-wrapper">
            <v-text-field
              prepend-inner-icon="mdi-magnify"
              v-model="search"
              filled
              clearable
              dense
              autofocus
              hide-details
              solo
            ></v-text-field>
          </v-list>
          <v-list class="online-list">
            <FriendItem
              v-for="friend in filteredFriends"
              :key="friend._id"
              type="FRIEND"
              :name="friend.name"
              :avatar="friend.avatar"
              steam-url="props.item.steamUrl"
              id="props.item._id"
              rank="32"
              elo="1337"
              :status="friend.status"
            />
          </v-list>
        </v-list>
      </v-tab-item>
    </v-tabs-items>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'FriendsSidebar',
  data() {
    return {
      selectedList: 0,
      contextMenuOpen: false,
      hover: false,
      search: ''
    }
  },
  computed: {
    ...mapGetters([
      'sentFriendRequests',
      'receivedFriendRequests',
      'friends',
      'user',
      'profile'
    ]),
    collapsed() {
      return !(this.hover || this.contextMenuOpen)
    },
    onlineFriends() {
      return this.friends.filter((friend) => {
        return (
          friend.status.online || friend.status.inQueue || friend.status.inMatch
        )
      })
    },
    offlineFriends() {
      return this.friends.filter((friend) => {
        return (
          !friend.status.online &&
          !friend.status.inQueue &&
          !friend.status.inMatch
        )
      })
    },
    filteredFriends() {
      if (!this.search || this.search.length < 1) {
        return this.friends
      }

      const search = this.search.toLowerCase()
      return this.friends.filter((friend) => {
        return friend.name.toLowerCase().includes(search)
      })
    }
  },
  methods: {
    ...mapActions(['getFriends', 'getFriendRequests', 'getProfile']),
    addFriends() {
      this.$router.push('/search')
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getProfile()
      this.getFriends()
      this.getFriendRequests()
    })
  }
}
</script>

<style lang="scss">
html {
  scrollbar-width: none;
}

.v-navigation-drawer--mini-variant.v-navigation-drawer--custom-mini-variant
  .v-list-item {
  justify-content: unset !important;
}
.friendlist {
  scrollbar-width: none;

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

  .user-stats {
    display: flex;
    justify-content: start;
    overflow: unset;
    max-height: 0.8125rem;

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
  .v-list-item.user-item {
    padding-left: 2px;
    margin-top: 8px;
  }
  .friendlist-subheader {
    min-width: 200px;
    margin-bottom: -4px;

    i {
      margin-left: 18px;
      margin-right: 28px;
    }
  }
  .online-list,
  .offline-list {
    padding-top: 0px;
  }
  .v-application--is-ltr .v-toolbar__content > .v-btn.v-btn--icon:first-child,
  .v-application--is-ltr
    .v-toolbar__extension
    > .v-btn.v-btn--icon:first-child {
    margin-left: 0px;
  }
  .v-list-item__title.user-name {
    font-size: 0.875rem;
  }
  .friends-list-actions {
    div.v-slide-group__next,
    div.v-slide-group__prev {
      min-width: 1px;
      flex: auto;
    }

    .v-tab {
      min-width: 1px;
    }
  }
  .v-list-item__subtitle.user-status {
    font-size: 0.775rem;
    overflow: visible;
  }
  .v-slide-group:not(.v-slide-group--has-affixes) > .v-slide-group__prev,
  .v-slide-group:not(.v-slide-group--has-affixes) > .v-slide-group__next {
    display: none;
  }
  .v-slide-group__prev {
    display: none !important;
  }
  .user-settings {
    margin-left: 6px;
    margin-top: -7px;
  }
  .add-friends-button {
    padding: 0 16px;
  }
  .add-friends-button:hover {
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.1);
  }
}
.v-navigation-drawer__content {
  scrollbar-width: none;
}
::-webkit-scrollbar {
  width: 0; /* Remove scrollbar space */
  background: transparent; /* Optional: just make scrollbar invisible */
}
.friendlist .friends-list-actions div.v-slide-group__next {
  display: none;
}
.v-slide-group__wrapper {
  padding-left: 12px;
  padding-right: 12px;
}
.friendlist-content {
  min-height: 100%;
}
.search-wrapper .v-input.v-text-field {
  margin-left: 12px;
  margin-right: 12px;
}
</style>
