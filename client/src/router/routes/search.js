export default [
  {
    path: '/search',
    name: 'search',
    meta: {
      requiresAuth: true
    },
    component: () =>
      import(/* webpackChunkName: "search" */ '@/components/Search.vue')
  }
]
