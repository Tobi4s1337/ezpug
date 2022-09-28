import Vue from 'vue'
import '@/plugins/axios'
import vuetify from '@/plugins/vuetify'
import '@/plugins/veevalidate'
import '@/plugins/common'
import i18n from '@/plugins/i18n'
import App from '@/App.vue'
import router from '@/router'
import { store } from '@/store'
import VuetifyConfirm from 'vuetify-confirm'
import VueSocketIOExt from 'vue-socket.io-extended'
import { io } from 'socket.io-client'
import VueMoment from 'vue-moment';
import Moment from 'moment';
import 'moment/locale/de';
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const socket = io(process.env.VUE_APP_SOCKET_URL, {
  path: '/socket',
  debug: true
})

Vue.config.productionTip = false
Vue.use(VueToast);
Vue.use(VuetifyConfirm, { vuetify })
Vue.use(VueSocketIOExt, socket, { store })
Vue.use(VueMoment, { moment: Moment })
const app = new Vue({
  vuetify,
  router,
  store,
  i18n,
  render: (h) => h(App),
  created() {
    store.dispatch('setLocale', store.getters.locale)
    if (store.getters.isTokenSet) {
      store.dispatch('autoLogin')
    }
  }
}).$mount('#app')
