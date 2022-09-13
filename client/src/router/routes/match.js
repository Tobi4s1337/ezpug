export default [
  {
    path: '/match/:matchId',
    name: 'match',
    meta: {
      requiresAuth: false
    },
    component: () =>
      import(/* webpackChunkName: "search" */ '@/components/Match.vue')
  }
]
