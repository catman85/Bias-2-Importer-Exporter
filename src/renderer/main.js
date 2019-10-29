import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.mixin({
  methods: {
    sleep(ms) {
      console.debug("Sleeping for: " + ms)
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
})

/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')