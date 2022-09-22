<template>
  <v-card class="map-card">
    <v-img
      :class="{
        small: small,
        'team-one-banned': teamOneBanned,
        'team-two-banned': teamTwoBanned
      }"
      :src="'/maps/' + map.key + '.jpg'"
      aspect-ratio="1.7"
      height="78"
    ></v-img>
    <div class="map-name">{{ map.name }}</div>
    <div v-if="teamOneBanned" class="ban-left">B<br />A<br />N</div>
    <div v-if="teamTwoBanned" class="ban-right">B<br />A<br />N</div></v-card
  >
</template>

<script>
export default {
  name: 'MapCard',
  data() {
    return {}
  },
  props: {
    map: Object,
    teamOneBanned: Boolean,
    teamTwoBanned: Boolean
  },
  computed: {},
  methods: {}
}
</script>

<style scoped lang="scss">
.map-card {
  height: 78px;
  overflow: hidden;
}
.map-name {
  position: absolute;
  bottom: -2px;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  background: #0f0f1fbd;
  width: 100%;
  padding-bottom: 2px;
  letter-spacing: 1.2px;
}
.team-one-banned,
.team-two-banned {
  filter: brightness(40%);
}
.ban-left,
.ban-right {
  position: absolute;
  width: 22px;
  background: #f03a5fad;
  height: 52px;
  top: 0px;
  border-radius: 0px !important;
  z-index: 4;
  box-shadow: none !important;
  line-height: 15px;
  font-weight: 500;
  font-size: 12px;
  padding-top: 3px;
}
.ban-right {
  right: 0px;
}
</style>
