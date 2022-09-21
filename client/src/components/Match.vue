<template>
  <v-container fluid class="match-wrapper">
    <v-row>
      <v-sheet
        rounded
        class="mx-auto match-team-profile-wrapper"
        width="100%"
        elevation="4"
        color="brightBackground"
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
                    elevation="4"
                    :src="match.teamOne.captain.avatar"
                    :alt="match.teamOne.name"
                  />
                </v-avatar>
              </div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="match-status-wrapper">
                <div class="match-timer">
                  <Timer :date="getFutureTime()" />
                </div>
                <div class="match-status-text">{{ status }}</div>
              </div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="match-team-profile match-team-profile-align-left">
                <v-avatar class="match-team-profile-avatar">
                  <img
                    :src="match.teamTwo.captain.avatar"
                    :alt="match.teamTwo.name"
                  />
                </v-avatar>
                <div class="match-team-profile-team-stats">
                  <div class="match-team-profile-label">Team</div>
                  <div class="match-team-profile-team">
                    {{ match.teamTwo.captain.name }}
                  </div>
                </div>
              </div>
            </v-col>
          </v-row></v-container
        >
      </v-sheet>
    </v-row>
    <v-row>
      <v-container fluid class="mt-4">
        <v-row>
          <v-col cols="12" sm="4" class="ma-0 pa-0">
            <v-sheet
              rounded
              class="mx-auto match-team-players"
              width="100%"
              elevation="4"
              color="brightBackground"
            >
              <PlayerCard
                class="mb-3"
                :key="match.teamOne.captain.name"
                :name="match.teamOne.captain.name"
                :avatar="match.teamOne.captain.avatar"
                :elo="match.teamOne.captain.elo"
                :rank="match.teamOne.captain.rank"
                :captain="true"
              />
              <div v-for="(n, i) in 4" :key="i" :class="{ 'mb-3': i < 3 }">
                <PlayerCard
                  v-if="false && match.teamOne.players[i]"
                  :name="match.teamOne.players[i].name"
                  :avatar="match.teamOne.players[i].avatar"
                  :elo="match.teamOne.players[i].elo"
                  :rank="match.teamOne.players[i].rank"
                />
                <SkeletonPlayerCard v-else />
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12" sm="4" class="ma-0 pt-0 pb-0">
            <v-sheet
              style="height: 100%"
              rounded
              class="mx-auto match-team-players"
              width="100%"
              elevation="4"
              color="brightBackground"
              >
            </v-sheet>
          </v-col>
          <v-col cols="12" sm="4" class="ma-0 pa-0">
            <v-sheet
              rounded
              class="mx-auto match-team-players"
              width="100%"
              elevation="4"
              color="brightBackground"
            >
              <PlayerCard
                class="mb-3"
                :key="match.teamTwo.captain.name"
                :name="match.teamTwo.captain.name"
                :avatar="match.teamTwo.captain.avatar"
                :elo="match.teamTwo.captain.elo"
                :rank="match.teamTwo.captain.rank"
                :captain="true"
              />
              <div v-for="(n, i) in 4" :key="i" :class="{ 'mb-3': i < 3 }">
                <PlayerCard
                  v-if="false && match.teamTwo.players[i]"
                  :name="match.teamTwo.players[i].name"
                  :avatar="match.teamTwo.players[i].avatar"
                  :elo="match.teamTwo.players[i].elo"
                  :rank="match.teamTwo.players[i].rank"
                />
                <SkeletonPlayerCard v-else />
              </div>
            </v-sheet>
          </v-col> </v-row
      ></v-container>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import axios from 'axios'
import PlayerCard from '@/components/match/PlayerCard.vue'
import SkeletonPlayerCard from '@/components/match/SkeletonPlayerCard.vue'
import Timer from '@/components/common/Timer'

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
  components: { PlayerCard, Timer, SkeletonPlayerCard },
  computed: {
    status() {
      if (this.match.status === 'playerveto') {
        return 'Spielerwahl'
      }
      if (this.match.status === 'mapveto') {
        return 'pug8 bannt eine Map'
      }
      if (this.match.status === 'active') {
        return 'Aktiv'
      }
      return 'Beendet'
    }
  },
  methods: {
    //...mapActions([
    //  'changeMyPassword',
    //  'getProfile',
    //  'addProfileData',
    //  'saveProfile',
    //  'unlinkTeamSpeak'
    //]),
    getFutureTime() {
      let timeObject = new Date()
      timeObject = new Date(timeObject.getTime() + 1000 * 30)
      return timeObject
    }
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
  font-size: 20px;
}
.match-team-players {
  padding: 12px;
}
.match-timer {
  font-size: 32px;
  color: $success;
  font-weight: 800;
}
</style>
