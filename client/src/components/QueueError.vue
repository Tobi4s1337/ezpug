<template>
  <v-dialog v-model="dialog" width="680" height="288" @click:outside="close">
    <v-card
      class="queue-accept-wrapper"
      v-show="error.type === 'timeout'"
      v-if="error && error.players"
    >
      <v-card-title class="queue-accept title-text">
        SPIEL ABGEBROCHEN
      </v-card-title>

      <v-card-text class="queue-accept">
        <div
          class="queue-accept"
          v-for="player in error.players"
          :key="player.userId"
        >
          <v-list-item-avatar
            size="48"
            color="grey"
            class="user-avatar user-item"
            rounded
          >
            <img :src="player.avatar" :alt="player.name"
          /></v-list-item-avatar>
        </div>
      </v-card-text>
      <div class="accepted-amount" v-if="error.players.length > 1">
        Die Spieler
        <strong v-for="(player, index) in error.players" :key="player.userId"
          >{{ player.name }}
          {{ index + 1 === error.players.length ? ' ' : ', ' }}
        </strong>
        haben nicht rechtzeitig akzeptiert.
      </div>
      <div class="accepted-amount" v-else>
        Der Spieler
        <strong>{{ error.players[0].name }}</strong> hat nicht rechtzeitig
        akzeptiert.
      </div>
    </v-card>

    <v-card class="queue-accept-wrapper" v-show="error.type === 'kicked'">
      <v-card-title class="queue-accept title-text">
        SPIEL ABGEBROCHEN
      </v-card-title>

      <v-card-text class="queue-accept"
        ><lottie
          :options="defaultOptions"
          autoplay
          v-on:animCreated="handleAnimation"
        />
      </v-card-text>
      <div class="accepted-amount">Du hast nicht rechtzeitig akzeptiert.</div>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Lottie from 'vue-lottie'
import * as animationData from '@/assets/afk.json'

export default {
  name: 'QueueError',
  data() {
    return {
      dialog: true,
      defaultOptions: { animationData: animationData.default },
      animationSpeed: 1
    }
  },
  components: { lottie: Lottie },
  props: {
    error: Object
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
.queue-accept {
  display: flex;
  justify-content: center;
}
.user-item {
  margin-right: 6px !important;
  margin-left: 6px;
}
.queue-accept-wrapper {
  height: 288px;
  display: flex;
  flex-direction: column;
  justify-content: center;

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

.v-card__text.queue-accept {
  height: 238px;
  margin-top: -30px;
  margin-bottom: -40px;
}
</style>
