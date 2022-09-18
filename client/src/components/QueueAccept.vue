<template>
  <v-dialog v-model="dialog" width="680" height="240" persistent>
    <v-card class="queue-accept-wrapper" v-show="accepted">
      <v-card-title class="queue-accept title-text">
        MATCH AKZEPTIEREN
      </v-card-title>

      <v-card-text class="queue-accept">
        <div
          class="queue-accept"
          v-for="player in players"
          :key="player.avatar"
          :class="{ ready: player.accepted }"
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
      <div class="accepted-amount">9/10 Spieler sind bereit</div>
    </v-card>

    <v-card class="queue-accept-wrapper" v-show="!accepted">
      <v-card-title class="queue-accept title-text">
        MATCH AKZEPTIEREN
      </v-card-title>

      <v-card-text class="queue-accept">
        <div class="csgo-button" @click="accept()">ACCEPT</div>
      </v-card-text>
      <div class="accepted-amount">
        <Timer :date="getFutureTime()" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Timer from '@/components/common/Timer.vue'

export default {
  name: 'QueueAccept',
  data() {
    return {
      dialog: true
    }
  },
  props: {
    players: Array,
    accepted: Boolean
  },
  components: { Timer },
  computed: {},
  methods: {
    accept() {
      this.$emit('accepted')
    },
    getFutureTime() {
      let timeObject = new Date()
      timeObject = new Date(timeObject.getTime() + 1000 * 30)
      return timeObject
    }
  }
}
</script>

<style lang="scss">
.queue-accept {
  display: flex;
  justify-content: center;
}
.user-item {
  margin-right: 6px !important;
  margin-left: 6px;
}
.queue-accept-wrapper {
  height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .v-avatar {
    outline: 100px solid rgba(0, 0, 0, 0.336) !important;
    outline-offset: -100px;
    overflow: hidden;
  }

  .ready .v-avatar {
    border: 2px solid #3cfd3c !important;
    box-shadow: 0 0 5px #3cfd3c;
    outline: 100px solid #3cfd3c1a !important;
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
  height: 105px;
}
</style>
