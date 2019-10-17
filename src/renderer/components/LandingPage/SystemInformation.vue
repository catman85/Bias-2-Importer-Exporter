<template>
  <div>
    <div class="title">Information</div>
    <div class="items">
      <div class="item">
        <div class="name">Path:</div>
        <div class="value">{{ path }}</div>
      </div>
      <div class="item">
        <div class="name">Route Name:</div>
        <div class="value">{{ name }}</div>
      </div>
      <div class="item">
        <div class="name">Vue.js:</div>
        <div class="value">{{ vue }}</div>
      </div>
      <div class="item">
        <div class="name">Electron:</div>
        <div class="value">{{ electron }}</div>
      </div>
      <div class="item">
        <div class="name">Node:</div>
        <div class="value">{{ node }}</div>
      </div>
      <div class="item">
        <div class="name">Platform:</div>
        <div class="value">{{ platform }}</div>
      </div>
    </div>
    {{count}}
    {{directory}}
    <button class="alt" @click='showSaveDialog("wut")'>Open Save Dialog</button>
    <button class="alt" @click='selectFolder()'>Select Folder</button>
    <button class="alt" @click='showStateStuff()'>shot state</button>
  </div>
</template>

<script>
  import {
  mapState,
  mapActions
} from 'vuex'

const fs = require('fs')
const {
  dialog
} = require('electron').remote

  export default {
    data () {
      return {
        electron: process.versions.electron,
        name: this.$route.name,
        node: process.versions.node,
        path: this.$route.path,
        platform: require('os').platform(),
        vue: require('vue/package.json').version
      }
    },
    mounted () {},
    computed: {
      ...mapState({
        count: state => state.Counter.main,
        directory: state => state.Directory.dir
      })
    },
    methods: {
      showSaveDialog (content) {
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        dialog.showSaveDialog((fileName) => {
          if (fileName === undefined) {
            console.log("You didn't save the file")
            return
          }

          // fileName is a string that contains the path and filename created in the save file dialog.
          fs.writeFile(fileName, content, (err) => {
            if (err) {
              alert('An error ocurred creating the file ' + err.message)
            }
            console.debug('The file has been succesfully saved')
          })
        })
      },
      selectFolder () {
        dialog.showOpenDialog({
          title: 'Select a folder',
          properties: ['openDirectory']
        }, (folderPaths) => {
        // folderPaths is an array that contains all the selected paths
          if (folderPaths === undefined) {
            console.log('No destination folder selected')
          } else {
          // this.$store.dispatch('SET_DIR', {dir}); // we can't call the mutation directly which can modify the state
            this.$store.dispatch('setDir', folderPaths[0]) // calling the async action which can't modify the state
            console.log(folderPaths)
          }
        })
      },
      showStateStuff () {
        console.debug(this.$store.state.Directory.isDirSet)
        console.debug(this.$store.state.Directory.dir)
        console.debug(this.$store.state.Counter.main)
      }
    }
  }
</script>

<style scoped>
  .title {
    /* color: #888; */
    color:aqua;
    font-size: 18px;
    font-weight: initial;
    letter-spacing: .25px;
    margin-top: 10px;
  }

  .items {
    margin-top: 8px;
  }

  .item {
    display: flex;
    margin-bottom: 6px;
  }

  .item .name {
    color: #6a6a6a;
    margin-right: 6px;
  }

  .item .value {
    color: #35495e;
    font-weight: bold;
  }
</style>