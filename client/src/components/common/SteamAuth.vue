<template>
  <v-btn :disabled="disabledButton" @click="initSteamAuth()"
    >Authenticate with Steam</v-btn
  >
</template>

<script>
import axios from 'axios'

export default {
  name: 'SteamAuth',
  data() {
    return {
      windowRef: null
    }
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
          console.log('Not allowed')
          return
        }

        if (e.data.id) {
          console.log(e.data.id)
          axios.post('/steam', { id: e.data.id })
        } else {
          console.log('Invalid data')
        }
      })
    }
  }
}
</script>
