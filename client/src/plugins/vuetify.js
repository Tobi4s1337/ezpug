import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/src/styles/main.sass'
// import colors from 'vuetify/es5/util/colors'
// import VuetifyConfirm from 'vuetify-confirm'
import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify)

const opts = {
  theme: {
    dark: true,
    options: { customProperties: true },
    themes: {
      dark: {
        success: '#00ACC1',
        primary: '#008a7c',
        secondary: '#1b1b36',
        background: '#0f0f1f;',
        brightBackground: '#18182f',
        darkBackground: '#0a0a14'
      }
    }
  },
  iconfont: 'mdi'
}

export default new Vuetify(opts)
