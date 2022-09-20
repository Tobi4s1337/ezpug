<template>
  <v-container fluid class="match-wrapper">
    <v-row>
      <v-sheet
        rounded
        class="mx-auto match-team-profile-wrapper"
        width="100%"
        elevation="4"
        color="background"
      >
        <v-container fluid>
          <v-row>
            <v-col cols="12" sm="4">
              <div class="match-team-profile match-team-profile-align-right">
                <div class="match-team-profile-team-stats">
                  <div class="match-team-profile-label">Team</div>
                  <div class="match-team-profile-team">
                    {{ match.teamOne.captain.name }}
                  </div>
                </div>
                <v-avatar class="match-team-profile-avatar">
                  <img
                    :src="match.teamOne.captain.avatar"
                    :alt="match.teamOne.name"
                  />
                </v-avatar>
              </div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="match-status-wrapper">
                <v-sheet
                  color="darkBackground"
                  rounded
                  class="match-status-text"
                  >MAP-VETO</v-sheet
                >
                <v-sheet
                  color="darkBackground"
                  rounded
                  class="match-status-text"
                  >MAP-VETO</v-sheet
                >
              </div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="match-team-profile match-team-profile-align-left">
                <v-avatar class="match-team-profile-avatar">
                  <img
                    :src="match.teamOne.captain.avatar"
                    :alt="match.teamOne.name"
                  />
                </v-avatar>
                <div class="match-team-profile-team-stats">
                  <div class="match-team-profile-label">Team</div>
                  <div class="match-team-profile-team">
                    {{ match.teamOne.captain.name }}
                  </div>
                </div>
              </div>
            </v-col>
          </v-row></v-container
        >
      </v-sheet>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import axios from 'axios'

export default {
  metaInfo() {
    return {
      title: this.$store.getters.appTitle,
      titleTemplate: `${this.$t('match.TITLE')} - %s`
    }
  },
  data() {
    return {
      dialog: false,
      match: {}
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
  beforeRouteEnter(to, from, next) {
    axios
      .get('/match/' + to.params.matchId)
      .then(function (response) {
        next((vm) => {
          vm.match = response.data
        })
      })
      .catch(function (error) {
        next()
        console.log(error)
      })
  },
  async mounted() {
    this.$socket.client.emit('join-match', this.$route.params.matchId)
  }
}
</script>

<style lang="scss">
.match-wrapper {
  margin-top: 14px;
  max-width: 1344px;
}
.match-team-profile-align-right {
  text-align: right;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
.match-team-profile-align-left {
  text-align: left;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
.match-team-profile-team {
  font-size: 29px;
  color: #fff;
  line-height: 29px;
}
.match-team-profile-label {
  font-size: 12px;
  color: #c0c6d1;
  text-transform: uppercase;
}
.match-team-profile-team-stats {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.match-team-profile-avatar {
  margin: 0 20px;
  width: 80px !important;
  height: 80px !important;
}
.match-team-profile-wrapper {
  padding-top: 12px;
  padding-bottom: 12px;
}
.match-status-wrapper {
  display: flex;
  justify-content: center;
  vertical-align: middle;
  align-content: center;
  align-items: center;
  height: 100%;
  flex-direction: column;
}
.match-status-text {
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 4px;
  padding-bottom: 4px;
}
</style>
