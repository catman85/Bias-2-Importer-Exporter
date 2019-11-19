<template>
  <header>
    <h3>Bias Preset Importer/Exporter Tool
      <b-button class="alt" @click='selectPositiveGridFolder()'>Select Folder</b-button>
      
    </h3>
    <!-- <button class="alt" @click='showStateStuff()'>shot state</button> -->
    <!-- <button class="alt" @click='listFolder(positiveGridPath)'>list</button> -->
    <!-- <quick-menu :menu-count=count :icon-class=icons :menu-url-list=list></quick-menu> -->
    <radial-menu class="radial-menu"
      :itemSize="50"
      :radius="110"
      :rotate="180"
      :angle-restriction="90">
        <radial-menu-item class="radial-menu-item"
          v-for="(item, index) in this.items" 
          :key="index" 
          @click="() => handleClick(item)">
          <span><i class="fab fa-github"></i></span>
        </radial-menu-item>
      </radial-menu>
  </header>

</template>

<script>
  import quickMenu from 'vue-quick-menu'
  import {
    RadialMenu,
    RadialMenuItem
  } from 'vue-radial-menu'
  const {
    dialog
  } = require('electron').remote

  export default {
    components: {
      quickMenu,
      RadialMenu,
      RadialMenuItem
    },
    data() {
      return {
        position: 'top-right',
        count: 3,
        icons: ["fas fa-home", "fas fa-info-circle", "fab fa-github-alt"],
        list: [{
            'isLink': true,
            url: "/"
          }, {
            'isLink': true,
            url: "/sys-info"
          },
          {
            'isLink': false,
            url: "https://github.com/catman85/Bias-2-Importer-Exporter",
            isOpenNewTab: true
          }
        ],
              items: ['foo', 'bar', 'hello', 'world'],
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
      handleClick(item) {
       console.debug(item)
      }
    }
  }
</script>

<style>

</style>>