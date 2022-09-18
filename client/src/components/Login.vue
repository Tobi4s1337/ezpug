<template>
  <v-container fluid>
    <v-flex xs12 mt-5>
      <h3 class="mt-5 mb-2">Login using your Steam Account</h3>
      <SteamAuth type="LOGIN" @authenticated="steamLogin" />
    </v-flex>
  </v-container>
</template>

<script>
import router from '@/router'
import { mapActions } from 'vuex'

export default {
  metaInfo() {
    return {
      title: this.$store.getters.appTitle,
      titleTemplate: `${this.$t('login.TITLE')} - %s`
    }
  },
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    ...mapActions(['userLogin']),
    async submit() {
      await this.userLogin({
        email: this.email,
        password: this.password
      })
    },
    async steamLogin(steamId) {
      await this.userLogin({
        steamId
      })
    }
  },
  created() {
    if (this.$store.state.auth.isTokenSet) {
      router.push({ name: 'home' })
    }
  }
}
</script>
