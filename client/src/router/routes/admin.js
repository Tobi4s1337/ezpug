export default [
  {
    path: '/admin/users',
    name: 'admin-users',
    meta: {
      requiresAuth: true
    },
    component: () =>
      import(
        /* webpackChunkName: "admin-users" */ '@/components/AdminUsers.vue'
      )
  }
]
