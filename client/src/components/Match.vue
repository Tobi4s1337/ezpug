<template>
  <v-container fluid>
    <h1>Match Page</h1>
    <h2>{{ $route.params.matchId }}</h2>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  metaInfo() {
    return {
      title: this.$store.getters.appTitle,
      titleTemplate: `${this.$t('match.TITLE')} - %s`
    }
  },
  data() {
    return {
      dialog: false
    }
  },
  computed: {},
  methods: {
    //...mapActions([
    //  'changeMyPassword',
    //  'getProfile',
    //  'addProfileData',
    //  'saveProfile',
    //  'unlinkTeamSpeak'
    //]),
  },
  async mounted() {
    this.$socket.client.emit('join-match', this.$route.params.matchId)
  }
}
</script>
