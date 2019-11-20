<template>
  <header>
    <h3>Bias Preset Importer/Exporter Tool
      <b-button class="alt" @click='selectPositiveGridFolder()'>Select Folder</b-button>
      
    </h3>
    <!-- <button class="alt" @click='showStateStuff()'>shot state</button> -->
    <!-- <button class="alt" @click='listFolder(positiveGridPath)'>list</button> -->
    <!-- <quick-menu :menu-count=count :icon-class=icons :menu-url-list=list></quick-menu> -->
    <radial-menu class="radial-menu"
      :itemSize="60"
      :radius="95"
      :rotate="180"
      :angle-restriction="90">
        <radial-menu-item class="radial-menu-item"
          v-for="(item, index) in this.icons" 
          :key="index" 
          @click="() => handleClick(item)">
          <span>
            <!-- ATTENTION dynamic component -->
            <component :is="icons[index]"></component>
          </span>
        </radial-menu-item>
      </radial-menu>
  </header>

</template>

<script>
  import quickMenu from 'vue-quick-menu'
  import githubSvg from '../assets/github-svg'
  import homeSvg from '../assets/home-svg'
  import infoSvg from '../assets/info-svg'
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
      githubSvg,
      homeSvg,
      infoSvg,
      RadialMenu,
      RadialMenuItem
    },
    data() {
      return {
        icons: ["home-svg","info-svg","github-svg"],
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
       if(item=='info-svg'){
         this.$router.push({path: "/sys-info"})
       }else if(item=='home-svg'){
         this.$router.push({path: "/"})
       }else if(item=='github-svg'){
         window.open('https://github.com/catman85/Bias-2-Importer-Exporter', '_blank', 'nodeIntegration=no')
       }
      }
    }
  }
</script>

<style>

</style>>