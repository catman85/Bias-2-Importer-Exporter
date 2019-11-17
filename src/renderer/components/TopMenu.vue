<template>
  <header>
    <h1>Test</h1>
    <button class="alt" @click='selectPositiveGridFolder()'>Select Folder</button>
    <!-- <button class="alt" @click='showStateStuff()'>shot state</button> -->
    <!-- <button class="alt" @click='listFolder(positiveGridPath)'>list</button> -->
    <quick-menu :menu-count=count :icon-class=icons :menu-url-list=list></quick-menu>
  </header>

</template>

<script>
  import quickMenu from 'vue-quick-menu'
  const {
    dialog
  } = require('electron').remote

  export default {
    components: {
      quickMenu
    },
    data() {
      return {
        position: 'top-right',
        count: 2,
        icons: ["fa fa-github", "fa fa-comment", "fa fa-code", "fa fa-envelope"],
        list: [{
          'isLink': true,
          url: "/"
        }, {
          'isLink': true,
          url: "/sys-info"
        }],
        backgroundColor: '#17c4c5',
        color: '#ffffff',

      }
    },
    methods: {
      async selectPositiveGridFolder() {
        dialog.showOpenDialog({
          title: 'Select a folder',
          properties: ['openDirectory']
        }, async (folderPaths) => {
          // folderPaths is an array that contains all the selected paths
          if (folderPaths === undefined) {
            console.log('No destination folder selected')
            // triggers init()
            this.$store.dispatch('setDir', "")
          } else {
            // we can't call the mutation directly which can modify the state
            if (this.checkIfDirectoriesExists(folderPaths[0] + this.bankJsonRelPath)) {
              await this.$store.dispatch('setDir', folderPaths[0])
            } else {
              alert("This is not a Positive Grid folder")
              await this.$store.dispatch('setDir', "")
            }
            // await this.$store.dispatch('setDir', folderPaths[0])
            console.log(folderPaths)
          }
        })
      },
    }
  }
</script>

<style>

</style>>