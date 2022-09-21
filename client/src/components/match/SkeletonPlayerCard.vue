<template>
  <v-card class="skeleton-card"> </v-card>
</template>

<script>
export default {
  name: 'SkeletonPlayerCard',
  data() {
    return {}
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
}
</style>
