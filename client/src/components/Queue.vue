<template>
  <div class="queue-wrapper">
    <v-card
      outlined
      elevation="4"
      class="queue-card"
      :class="{ expanded: inQueue }"
    >
      <video
        v-if="inQueue"
        id="bgVideo"
        controls
        preload="true"
        autoplay
        loop
        playsinline
        style="pointer-events: none"
        muted
      >
        <source src="globe.webm" type="video/webm" />
      </video>

      <v-btn
        color="success"
        fab
        large
        dark
        bottom
        :disabled="!onTeamSpeak"
        left
        class="v-btn--example"
        @click="joinQueue()"
        v-if="!inQueue"
      >
        <v-icon>mdi-play</v-icon>
      </v-btn>
      <v-btn
        color="red"
        fab
        large
        dark
        bottom
        left
        class="v-btn--example"
        @click="leaveQueue()"
        v-else
      >
        <v-icon>mdi-stop</v-icon>
      </v-btn>
      <v-expand-x-transition>
        <div class="queue-info" v-show="inQueue">
          <div class="queue-status">In der Warteschlange</div>
          <div class="queue-count">
            Suchende Spieler: <strong>{{ count }}</strong>
          </div>
          <div class="queue-time"><Timer :date="new Date()" /></div>
        </div>
      </v-expand-x-transition>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Timer from '@/components/common/Timer.vue'

export default {
  name: 'Queue',
  data() {
    return {
      count: 0
    }
  },
  components: { Timer },
  methods: {
    ...mapActions(['addProfileData']),
    joinQueue() {
      this.$socket.client.emit('queue-message', { event: 'join' })
    },
    leaveQueue() {
      this.$socket.client.emit('queue-message', { event: 'leave' })
    }
  },
  computed: {
    ...mapGetters(['user']),
    inQueue() {
      if (this.user && this.user.status && this.user.status.inQueue) {
        return true
      }

      return false
    },
    onTeamSpeak() {
      if (this.user && this.user.status && this.user.status.teamSpeak) {
        return true
      }

      return false
    }
  },
  sockets: {
    PUBLIC_QUEUE_UPDATE(data) {
      this.count = data.count
    }
    //queue() {
    //  if (this.$store.getters.isTokenSet) {
    //    this.$socket.client.emit('authenticate', {
    //      key: this.$store.getters.token
    //    })
    //  }
    //},
  }
}
</script>

<style lang="scss">
.queue-wrapper {
  position: absolute;
  left: 15px;
  bottom: 15px;
  z-index: 2;

  #bgVideo {
    position: absolute;
    width: 320px;
    left: 0px;
    overflow: hidden;
    display: inline;
    bottom: 0px;
    -o-filter: blur(2px);
    filter: blur(2px);
  }

  .queue-card {
    padding: 6px;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 100%;
    max-width: 250px;
    min-height: 56px;
    font-family: 'Play', sans-serif;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #fff;
    font-weight: bold;
    -webkit-animation: lgTHfl 0.25s;
    animation: lgTHfl 0.25s;
    -webkit-transform-origin: left;
    -ms-transform-origin: left;
    transform-origin: left;
    border-radius: 99999px;

    &.expanded {
      width: 250px;
    }

    div.queue-info {
      width: 100%;
      border-radius: 0px !important;
      padding: 2px 6px;
      max-height: 64px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
      line-height: 18px;
      z-index: 3;

      .queue-status,
      .queue-count,
      .queue-time {
        min-width: 174px;
      }

      .queue-count,
      .queue-time {
        font-weight: 400;
      }
    }
  }
}
</style>
