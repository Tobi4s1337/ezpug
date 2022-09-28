<template>
  <v-app>
    <Toolbar v-if="false" />
    <v-main class="text-center">
      <NavigationSidebar />
      <FriendsSidebar v-if="user" />
      <NameDialog v-if="user && !profile.name && !showLoading" />
      <TeamspeakDialog
        v-if="profile.name && !profile.teamSpeakId && !showLoading"
        ref="teamspeak"
      />
      <loading />
      <v-container
        fluid
        style="
          padding: 0px;
          max-width: calc(100% - 182px);
          margin-left: 104px;
          max-height: 100vh;
          overflow-y: auto;
          scrollbar-width: thin;
        "
      >
        <transition name="fade" mode="out-in">
          <router-view :key="$route.path" />
        </transition>
      </v-container>
    </v-main>

    <Queue v-if="user" />
    <MatchResult
      v-if="matchResult"
      :match-result="matchResult"
      @close="closeMatchResult()"
    />
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Toolbar from '@/components/core/Toolbar.vue'
import Loading from '@/components/core/Loading.vue'
import NavigationSidebar from '@/components/core/NavigationSidebar.vue'
import TeamspeakDialog from '@/components/TeamspeakDialog.vue'
import NameDialog from '@/components/NameDialog.vue'
import Queue from '@/components/Queue.vue'
import MatchResult from '@/components/MatchResult.vue'

export default {
  name: 'App',
  metaInfo() {
    return {
      title: this.appTitle,
      htmlAttrs: {
        lang: this.$i18n.locale
      },
      meta: [
        { name: 'msapplication-TileColor', content: '#ffc40d' },
        { name: 'theme-color', content: '#ffffff' },
        {
          name: 'apple-mobile-web-app-title',
          content: this.appTitle
        },
        { name: 'application-name', content: this.appTitle }
      ],
      link: [
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png'
        },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'mask-icon', color: '#5bbad5', href: '/safari-pinned-tab.svg' },
        { rel: 'favicon', href: '/favicon.ico' }
      ]
    }
  },
  data() {
    return {
      matchResult: null
    }
  },
  components: {
    Toolbar,
    Loading,
    NavigationSidebar,
    TeamspeakDialog,
    Queue,
    NameDialog,
    MatchResult
  },
  computed: {
    ...mapGetters(['user', 'profile', 'showLoading']),
    appTitle() {
      return this.$store.getters.appTitle
    }
  },
  methods: {
    ...mapActions(['getProfile']),
    closeMatchResult() {
      this.matchResult = null
    }
  },
  sockets: {
    connect() {
      if (this.$store.getters.isTokenSet) {
        this.$socket.client.emit('authenticate', {
          key: this.$store.getters.token
        })
      }
    },
    async authenticated() {
      await this.getProfile()
      if (!this.profile.teamSpeakId) {
        this.$refs.teamspeak.getUsers()
      }
    },
    PRIVATE_MATCH_START(data) {
      console.log('Private match start')
      console.log(data)
      if (data.matchId) {
        console.log(this.$route)
        this.$router.push({ path: '/match/' + data.matchId })
      }
    },
    PRIVATE_MATCH_RESULT(data) {
      console.log('match result event')
      console.log(data)
      this.matchResult = data
    },
    PUBLIC_DROP(data) {
      this.$toast.open({
        type: 'success',
        position: 'bottom-right',
        duration: 6500,
        message: `Der Spieler ${data.username} hat einen Drop erhalten 🎉: ${data.dropName}`
      })
    }
  }
}
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

#app.theme--dark.v-application .theme--dark.v-data-table {
  background-color: $bright-background !important;
}

.theme--dark.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > td:last-child,
.theme--dark.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > th:last-child,
.theme--dark.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > td:not(.v-data-table__mobile-row),
.theme--dark.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > th:not(.v-data-table__mobile-row),
.theme--dark.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr:last-child
  > th {
  border-color: $border-color-filled !important;
}

#app.theme--dark.v-application {
  background: $background-color;

  .theme--dark.v-data-table {
    background-color: $dark-background;
  }

  .theme--dark.v-divider {
    border-color: $border-color-filled;
  }

  .theme--dark.v-navigation-drawer .v-divider {
    border-color: $border-color;
  }

  .v-application .v-btn.secondary {
    border: 1px solid $border-color !important;
    border-color: $border-color !important;

    &:hover {
      border: 1px solid $border-color-hover !important;
      border-color: $border-color-hover !important;
    }
  }

  .theme--dark.v-app-bar.v-toolbar.v-sheet {
    background-color: $bright-background;
  }

  .v-card.theme--dark.v-card {
    background-color: $bright-background;
    border: thin solid $border-color;
  }

  .v-text-field--outlined > .v-input__control > .v-input__slot,
  .v-text-field--filled > .v-input__control > .v-input__slot {
    background-color: $bright-background;
  }
}
.v-toast__text {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
}
.v-toast__item--success {
  background-color: $success !important;
  background: $success !important;
}
</style>
