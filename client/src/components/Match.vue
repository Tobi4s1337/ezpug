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
                class="mb-3 picking"
                :key="match.teamOne.captain.name"
                :name="match.teamOne.captain.name"
                :avatar="match.teamOne.captain.avatar"
                :elo="match.teamOne.captain.elo"
                :rank="match.teamOne.captain.rank"
                :captain="true"
              />
              <div v-for="(n, i) in 4" :key="i" :class="{ 'mb-3': i < 3 }">
                <PlayerCard
                  v-if="match.teamOne.players[i]"
                  :name="match.teamOne.players[i].name"
                  :avatar="match.teamOne.players[i].avatar"
                  :elo="match.teamOne.players[i].elo"
                  :rank="match.teamOne.players[i].rank"
                />
                <SkeletonPlayerCard v-else />
              </div>
            </v-sheet>
          </v-col>
          <v-col
            cols="12"
            sm="4"
            class="ma-0 pt-0 pb-0"
            v-if="match.status === 'playerveto'"
          >
            <v-sheet
              style="height: 100%"
              rounded
              class="mx-auto match-team-players"
              width="100%"
              elevation="4"
              color="brightBackground"
            >
              <div
                v-for="(player, index) in playersExcludingCaptains"
                :key="player._id"
                :class="{ 'mb-3': index < 7 }"
              >
                <PlayerCard
                  :name="player.name"
                  :avatar="player.avatar"
                  :elo="player.elo"
                  :rank="player.rank"
                  :small="true"
                  class="player-card"
                  :class="{ picked: !playersToPick.includes(player._id) }"
                />
              </div>
            </v-sheet>
          </v-col>
          <v-col
            cols="12"
            sm="4"
            class="ma-0 pt-0 pb-0"
            v-else-if="match.status === 'mapveto'"
          >
            <v-sheet
              style="height: 100%"
              rounded
              class="mx-auto match-mapveto"
              width="100%"
              elevation="4"
              color="brightBackground"
            >
              <h2 class="mb-4 mt-2">{{ match.mapVeto.pool.name }}</h2>
              <div
                v-for="(map, index) in match.mapVeto.pool.maps"
                :key="map.key"
                :class="{ 'mb-3': index < 6 }"
              >
                <MapCard
                  :map="map"
                  small
                  :team-one-banned="match.mapVeto.teamOneBans.includes(map.key)"
                  :team-two-banned="match.mapVeto.teamTwoBans.includes(map.key)"
                  class="map-card"
                  :class="{ banned: !mapsToBan.includes(map.key) }"
                />
              </div>
            </v-sheet>
          </v-col>
          <v-col
            cols="12"
            sm="4"
            class="ma-0 pt-0 pb-0"
            v-else-if="match.status === 'active'"
          >
            <v-card class="map-card map-card-large banned mb-3">
              <v-img
                :src="'/maps/' + match.map.key + '.jpg'"
                aspect-ratio="1.7"
                height="148"
              ></v-img>
              <div class="match-score">00 : 00</div>
            </v-card>
            <v-sheet
              style="height: calc(100% - 162px)"
              rounded
              class="mx-auto match-active"
              width="100%"
              elevation="4"
              color="brightBackground"
            >
              <div class="match-actions-wrapper">
                <div>
                  <div class="mb-2">Zum Verbinden mithilfe der Konsole</div>
                  <v-text-field
                    style="width: 254px; margin: auto"
                    value="connect 127.0.0.1:2567"
                    readonly
                    dense
                    outlined
                    append-outer-icon="mdi-content-copy"
                    ref="serverip"
                    @click:append-outer="copyText"
                  ></v-text-field>
                  <v-btn color="success">Verbinden</v-btn>
                </div>
                <v-divider class="mt-5 mb-5"></v-divider>
                <div>
                  <div class="mb-2">Gibt es ein Problem?</div>
                  <v-btn color="error">Admin rufen</v-btn>
                </div>
              </div>
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
                  v-if="match.teamTwo.players[i]"
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
import MapCard from '@/components/match/MapCard.vue'
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
  components: { PlayerCard, Timer, SkeletonPlayerCard, MapCard },
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
    },
    playersExcludingCaptains() {
      return this.match.players.filter(
        (player) =>
          player._id !== this.match.teamOne.captain._id &&
          player._id !== this.match.teamTwo.captain._id
      )
    },
    mapsToBan() {
      let maps = []

      for (const map of this.match.mapVeto.pool.maps) {
        if (
          !this.match.mapVeto.teamOneBans.includes(map.key) &&
          !this.match.mapVeto.teamTwoBans.includes(map.key)
        ) {
          maps.push(map.key)
        }
      }

      return maps
    },
    playersToPick() {
      let availablePlayers = []
      const players = this.match.players
      let teamOnePlayers = this.playersToIds(this.match.teamOne.players)
      teamOnePlayers.push(this.match.teamOne.captain._id)
      let teamTwoPlayers = this.playersToIds(this.match.teamTwo.players)
      teamTwoPlayers.push(this.match.teamTwo.captain._id)

      for (const player of players) {
        if (
          !teamOnePlayers.includes(player._id) &&
          !teamTwoPlayers.includes(player._id)
        ) {
          availablePlayers.push(player._id)
        }
      }

      return availablePlayers
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
    copyText() {
      const input = this.$refs.serverip.$refs.input
      input.select()
      document.execCommand('copy')
      input.setSelectionRange(0, 0) // unselect
    },
    getFutureTime() {
      let timeObject = new Date()
      timeObject = new Date(timeObject.getTime() + 1000 * 30)
      return timeObject
    },
    playersToIds(players) {
      const ids = []
      for (const player of players) {
        if (player._id) {
          ids.push(player._id)
        } else {
          ids.push(player)
        }
      }
      return ids
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
  margin: 0 14px;
  width: 80px !important;
  height: 80px !important;
  border-radius: 8px;
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
.match-team-players,
.match-mapveto,
.match-active {
  padding: 12px;
}
.match-timer {
  font-size: 32px;
  color: $success;
  font-weight: 800;
  .timer.final {
    color: $error;
  }
}

.match-score {
  font-size: 32px;
  color: $success;
  font-weight: 800;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  background: rgba(24, 24, 47, 0.88);
  padding: 0px 12px;
  border-radius: 4px;
  color: white;
}
.player-card {
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  &.picked {
    filter: brightness(40%);
  }
  &:not(.picked) {
    &:hover {
      outline: 2px solid $success !important;
      cursor: pointer;
      box-sizing: border-box !important;
    }
  }
}

.map-card {
  overflow: hidden;
  &:not(.banned) {
    &:hover {
      outline: 2px solid $error !important;
      cursor: pointer;
      box-sizing: border-box !important;
    }
  }
}

.picking {
  outline: 2px solid $success !important;
}
h2 {
  font-size: 22px;
  font-weight: 500;
}
.match-active {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.match-actions-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}
</style>
