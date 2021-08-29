<template>
  <v-footer height="34" class="d-block text-center">
    <div class="text-right">EZPUG v{{ appVersion }}</div>
  </v-footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    appVersion() {
      return this.$store.getters.appVersion
    }
  }
}
</script>
