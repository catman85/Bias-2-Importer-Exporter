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
    },
    nativePath(path) {
      // Possible values are: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
      let platform = require('os').platform();
      if(platform === "win32"){
        // console.debug(path.replace(/\//g, "\\"))
        path = path.replace(/\//g, "\\");
      }
      // console.debug("changing Path: " + path + platform)
      return path;
    }
  }
})

Vue.filter('filterTest', function(p){
    console.debug("changing Path: " + p)
    return p;
});

/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')