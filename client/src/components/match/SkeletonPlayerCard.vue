<template>
  <v-card class="skeleton-card" :class="{ small: small }"> </v-card>
</template>

<script>
export default {
  name: 'SkeletonPlayerCard',
  data() {
    return {}
  },
  props: {
    small: Boolean
  },
  computed: {},
  methods: {}
}
</script>

<style scoped lang="scss">
.skeleton-card {
  height: 135px;
  border: dashed 3px rgba(34, 34, 68, 1) !important;
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
  &.small {
    height: 78px;
  }
}
</style>
