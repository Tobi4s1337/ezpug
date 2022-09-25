<template>
  <v-dialog v-model="dialog" width="680" height="400" @click:outside="close">
    <v-card class="match-result-wrapper" v-if="matchResult.victory">
      <v-card-title class="match-result title-text">
        Das war einfach! GG
      </v-card-title>

      <v-card-text class="match-result match-result-text"
        ><Lottie
          style="margin-top: -30px"
          :options="defaultOptionsWin"
          autoplay
          v-on:animCreated="handleAnimation"
        />
      </v-card-text>
      <div class="elo-text">
        Du hast in diesem Spiel
        <span class="highlight-success">12</span> Elo-Punkte gewonnen!<br />
        Dein Elo-Score ist jetzt <strong>{{ matchResult.newElo }}</strong>
      </div>
    </v-card>

    <v-card class="match-result-wrapper" v-else>
      <v-card-title class="match-result title-text">
        Woran hat et jelegen?
      </v-card-title>

      <v-card-text class="match-result match-result-text"
        ><Lottie
          :options="defaultOptionsLose"
          autoplay
          v-on:animCreated="handleAnimation"
        />
      </v-card-text>
      <div class="elo-text">
        Du hast in diesem Spiel <span class="highlight-red">10</span> Elo-Punkte
        verloren.<br />Dein Elo-Score ist jetzt
        <strong>{{ matchResult.newElo }}</strong>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Lottie from 'vue-lottie'
import * as loseData from '@/assets/lose.json'
import * as winData from '@/assets/trophy.json'
export default {
  name: 'MatchResult',
  data() {
    return {
      dialog: true,
      defaultOptionsLose: { animationData: loseData.default },
      defaultOptionsWin: { animationData: winData.default },
      animationSpeed: 1,
      anim: true
    }
  },
  components: { Lottie },
  props: {
    matchResult: Object
  },
  methods: {
    handleAnimation: function (anim) {
      this.anim = anim
    },
    close() {
      this.$emit('closed')
    }
  }
}
</script>

<style lang="scss" scoped>
.match-result {
  display: flex;
  justify-content: center;
}
.user-item {
  margin-right: 6px !important;
  margin-left: 6px;
}
.match-result-wrapper {
  height: 400px;
  display: flex;
  flex-direction: column;
  display: flex;
  justify-content: space-evenly;
  align-content: center;

  .v-avatar {
    outline: 100px solid rgba(0, 0, 0, 0.336) !important;
    outline-offset: -100px;
    overflow: hidden;

    border: 2px solid #fd3c3c !important;
    box-shadow: 0 0 5px #fd3c3c;
    outline: 100px solid #fd3c3c19 !important;
  }
}
.accepted-amount {
  text-align: center;
}
.csgo-button {
  font-size: 60px;
  font-family: 'Rajdhani', sans-serif;
  text-align: center;
  line-height: 85px;
  color: #fff;
  margin: 0 auto;
  margin-top: 0px;
  width: 350px;
  height: 85px;
  background: linear-gradient(#1d7751, #0e382c);
  border: 3px #25793b solid;
  border-radius: 5px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  transition: 0.1s;
  transform: scale(1);
  cursor: pointer;
  -webkit-user-select: none;
  box-shadow: 0 0 50px rgba(0, 117, 9, 0.5);
  overflow: hidden;
}

.csgo-button:hover {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.csgo-button:active {
  background: linear-gradient(#1f8258, #114435);
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  transform: scale(1);
  box-shadow: 0 0 75px rgba(43, 137, 68, 0.5);
}

.csgo-button:after {
  content: '';
  position: relative;
  top: -120px;
  left: -90px;
  display: block;
  width: 35px;
  height: 150px;
  background: rgba(255, 255, 255, 0.5);
  transform: rotate(35deg);
  -webkit-filter: blur(20px);
  transition: none;
}

.csgo-button:hover:after {
  left: 400px;
  transition: 0.3s ease-in-out;
}

.v-dialog > .v-card > .v-card__title.title-text {
  font-size: 2.3rem;
  padding-top: 6px;
  padding-bottom: 24px;
}

.v-card__text.match-result {
  height: 238px;
  margin-top: -30px;
  margin-bottom: -40px;
}
.match-result-text {
  display: flex;
  flex-direction: column;
}
.elo-text {
  text-align: center;
  color: white;
  font-size: 22px;
}
.highlight-red {
  color: $error;
  font-weight: 800;
}
.highlight-success {
  color: $success;
  font-weight: 800;
}
.title-text {
  padding: 0px !important;
}
</style>
