<template>
  <v-app>
    <Toolbar />
    <v-main class="text-center">
      <FriendsSidebar v-if="user" />
      <TeamspeakDialog
        v-if="profile.name && !profile.teamSpeakId && !showLoading"
        ref="teamspeak"
      />
      <WhatsAppDialog />
      {{ profile }}
      <loading />
      <v-container fluid>
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Toolbar from '@/components/core/Toolbar.vue'
import Loading from '@/components/core/Loading.vue'
import Footer from '@/components/core/Footer.vue'
import TeamspeakDialog from '@/components/TeamspeakDialog.vue'
import WhatsAppDialog from '@/components/WhatsAppDialog.vue'

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
  components: {
    Toolbar,
    Loading,
    Footer,
    TeamspeakDialog,
    WhatsAppDialog
  },
  computed: {
    ...mapGetters(['user', 'profile', 'showLoading']),
    appTitle() {
      return this.$store.getters.appTitle
    }
  },
  methods: {
    ...mapActions(['getProfile'])
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
    }
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
