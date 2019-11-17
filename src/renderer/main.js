import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'
import myMixins from './mixins'
import './plugins/bootstrap-vue'

// scss
import './assets/scss/main.scss'


if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

import * as filters from './filters'
// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.mixin(myMixins);

/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')