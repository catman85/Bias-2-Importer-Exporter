<template>
  <div>
    <b-jumbotron bg-variant="info" text-variant="white" border-variant="dark">
      <template v-slot:header>System Information</template>

      <template v-slot:lead>
        Seriously, I don't know why I put this here. My life is meaningless...
      </template>

      <hr class="my-4">

      <b-list-group style="color:black;">
        <b-list-group-item>Platform: {{platform}}</b-list-group-item>
        <b-list-group-item>Path: {{path}}</b-list-group-item>
        <b-list-group-item>Route Name: {{name}}</b-list-group-item>
        <b-list-group-item>Vue.js {{vue}}</b-list-group-item>
        <b-list-group-item>Electron: {{electron}}</b-list-group-item>
        <b-list-group-item>Node: {{node}}</b-list-group-item>
      </b-list-group>
    </b-jumbotron>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        items: [{
            path: this.path,
            routeName: this.name
          },
          {
            vueJs: this.vue,
            Electron: this.electron
          }
        ]
      }
    }
  }
</script>>