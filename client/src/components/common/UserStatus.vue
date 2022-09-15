<template>
  <span
    v-if="status"
    :class="{
      online: status.online,
      offline: !status.online,
      active: status.inQueue || status.inMatch
    }"
    >{{ statusText }}
    <v-icon v-if="status.teamSpeak" small class="ml-1 ts-icon"
      >mdi-headphones</v-icon
    >
    <img
      v-if="false && status.teamSpeak"
      class="teamspeak-icon"
      src="/teamspeak.svg"
      alt="TeamSpeak Icon"
  /></span>
</template>

<script>
import { getSince } from '@/utils/utils.js'

export default {
  name: 'UserStatus',
  data() {
    return {}
  },
  props: {
    status: Object
  },
  computed: {
    statusText() {
      if (this.status.online) {
        if (this.status.inQueue) {
          return this.$t('status.IN_QUEUE')
        }
        if (this.status.inMatch) {
          return this.$t('status.IN_MATCH')
        }
        return this.$t('status.ONLINE')
      }
      return (
        this.$t('status.LAST_SEEN') + ' ' + this.getSince(this.status.lastSeen)
      )
    }
  },
  methods: {
    getSince(date) {
      window.__localeId__ = this.$store.getters.locale
      return getSince(date)
    }
  }
}
</script>

<style scoped lang="scss">
.online {
  color: #57cbde;
  display: flex;
  justify-content: start;
  vertical-align: center;
  vertical-align: middle;
  align-items: center;
  max-height: 16px;
  .ts-icon {
    color: #57cbde;
  }
}
.offline {
  color: #898989;
  display: flex;
  max-height: 16px;
  justify-content: start;
  vertical-align: center;
  vertical-align: middle;
  align-items: center;

  .ts-icon {
    color: #898989;
  }
}
.online.active {
  color: #90ba3c;
  .ts-icon {
    color: #90ba3c;
  }
}
.teamspeak-icon {
  width: 28px;
  height: 28px;
  margin-left: 5px;
  transform: translateY(-2px);
}
</style>
