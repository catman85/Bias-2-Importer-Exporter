import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'
import myMixins from './mixins'
import * as filters from './filters'
import BootstrapVue from 'bootstrap-vue'

// npm install bootstrap-vue bootstrap
Vue.use(BootstrapVue)
import './assets/scss/main.scss'

import { DropdownPlugin } from 'bootstrap-vue'
Vue.use(DropdownPlugin)



if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

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