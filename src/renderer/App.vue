<template>
  <div id="app">
    <top-menu></top-menu>
    <router-view></router-view>
  </div>
</template>

<script>
import TopMenu from '@/components/TopMenu.vue'
  export default {
    name: 'bias-2-ie',
    components: {
      TopMenu
    },
  }
</script>

<style>
  /* CSS */
</style>
