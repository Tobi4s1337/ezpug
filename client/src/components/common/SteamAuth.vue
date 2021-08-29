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
      const windowOpts = this.getWindowOpts()
      const windowUrl = `${process.env.VUE_APP_API_URL}/steam/`
      this.windowRef = window.open(windowUrl, '', windowOpts)
      const eventMethod = window.addEventListener
        ? 'addEventListener'
        : 'attachEvent'
      const eventer = window[eventMethod]
      const messageEvent =
        eventMethod === 'attachEvent' ? 'onmessage' : 'message'
      eventer(messageEvent, (e) => {
        if (e.origin !== process.env.VUE_APP_FRONTEND_URL) {
          console.log('Not allowed')
          return
        }

        if (e.data.id) {
          if (this.type === 'LOGIN') {
            this.handleSteamLogin(e.data.id)
          } else if (this.type === 'LINK') {
            this.handleSteamLink(e.data.id)
          }
        } else {
          console.log('Invalid data')
        }
      })
    },
    getWindowOpts() {
      const windowArea = {
        width: 600,
        height: Math.floor(window.outerHeight * 0.5)
      }

      if (windowArea.height < 630) {
        windowArea.height = 630
      }
      windowArea.left = Math.floor(
        window.screenX + (window.outerWidth - windowArea.width) / 2
      )
      windowArea.top = Math.floor(
        window.screenY + (window.outerHeight - windowArea.height) / 8
      )

      return `toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0,
    width=${windowArea.width},height=${windowArea.height},
    left=${windowArea.left},top=${windowArea.top}`
    },
    async handleSteamLogin(steamId) {
      this.$emit('authenticated', steamId)
    },
    async handleSteamLink(steamId) {
      try {
        const { data } = await axios.post('/steam', { steamId })
        console.log(data)
        this.$emit('steam-link', data)
      } catch (error) {
        handleError(error, this.$store.commit, (e) => {
          console.log(e)
        })
      }
    }
  }
}
</script>
