<template>
  <span
    :class="{
      online: status.online,
      offline: !status.online,
      active: status.inQueue || status.inMatch
    }"
    >{{ statusText }}</span
  >
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
      return this.$t('status.LAST_SEEN') + ' ' + this.getSince(this.status.lastSeen)
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
}
.offline {
  color: #898989;
}
.online.active {
  color: #90ba3c;
}
</style>
