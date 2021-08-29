<template>
  <v-btn :disabled="disabledButton" @click="initSteamAuth()"
    >Authenticate with Steam</v-btn
  >
</template>

<script>
import axios from 'axios'
import { handleError } from '../../utils/utils'

export default {
  name: 'SteamAuth',
  data() {
    return {
      windowRef: null
    }
  },
  props: {
    type: String // LOGIN, LINK
  },
  computed: {
    disabledButton() {
      return this.$store.state.loading.showLoading
    }
  },
  methods: {
    initSteamAuth() {
      const windowUrl = `${process.env.VUE_APP_API_URL}/steam/`
      this.windowRef = window.open(
        windowUrl,
        '',
        'width=600,height=400,left=200,top=200'
      )
      const eventMethod = window.addEventListener
        ? 'addEventListener'
        : 'attachEvent'
      const eventer = window[eventMethod]
      const messageEvent =
        eventMethod === 'attachEvent' ? 'onmessage' : 'message'
      eventer(messageEvent, (e) => {
        if (e.origin !== process.env.VUE_APP_FRONTEND_URL) {
          return
        }

        if (e.data.id) {
          if (this.type === 'LOGIN') {
            this.handleSteamLogin(e.data.id)
          } else if (this.type === 'LINK') {
            this.handleSteamLink(e.data.id)
          }
        }
      })
    },
    async handleSteamLogin(steamId) {
      this.$emit('authenticated', steamId)
    },
    async handleSteamLink(steamId) {
      try {
        const { data } = await axios.post('/steam', { steamId })
        this.$emit('steam-link', data)
      } catch (error) {
        handleError(error, this.$store.commit, (e) => {})
      }
    }
  }
}
</script>
