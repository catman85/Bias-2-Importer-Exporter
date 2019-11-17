import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/views/LandingPage').default
    },
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/sys-info',
      name: 'system-information',
      component: require('@/views/Info').default
    }
  ]
})
