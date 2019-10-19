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
    <button class="alt" @click='listFolder(searchContents)'>list</button>
    <button class="alt" @click='viewJson()'>view json names</button>
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

  const util = require('util');

  const jsonQ = require("jsonq");


  export default {
    data() {
      return {
        electron: process.versions.electron,
        name: this.$route.name,
        node: process.versions.node,
        path: this.$route.path,
        platform: require('os').platform(),
        vue: require('vue/package.json').version,
        contents: Array,
        jsonObj: {
          "age": 30,
          "name": "Angela",
          "husband": {
            "age": 23,
            "name": "William"
          }
        },
        filePathJson: '/home/jim/Documents/bank.json' // String
      }
    },
    mounted() {},
    computed: {
      ...mapState({
        count: state => state.Counter.main,
        directory: state => state.Directory.dir
      })
    },
    methods: {
      showSaveDialog(content) {
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
      selectFolder() {
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
      showStateStuff() {
        console.debug(this.$store.state.Directory.isDirSet)
        console.debug(this.$store.state.Directory.dir)
        console.debug(this.$store.state.Counter.main)
        console.debug(this.$store.state.Directory.contents)
      },
      async listFolder(callback) {
        const readdir = util.promisify(fs.readdir);

        // fs.readdir(this.directory, (err, dir) => {
        // for (let filePath of dir) {
        // console.log(filePath);
        // }
        // });

        try {
          this.contents = await readdir(this.directory) // ls
        } catch (err) {
          console.log(err);
        }
        if (this.contents === undefined) {
          console.log('undefined');
        } else {
          console.log(this.contents);
        }
        // console.debug(this.contents);
        this.$store.dispatch('setContents', this.contents);
        // console.debug(cons);
        // return cons;
        // return contents;
        // console.debug("Hello");
        callback(); //searchContents
      },
      async viewJson() {
        // var jsonQobj = jsonQ(this.jsonObj);
        // console.debug(jsonQobj.find('bank_name').value())

        const readfile = util.promisify(fs.readFile);

        this.jsonObj = await readfile(this.filePathJson,'utf-8');
        console.debug(this.jsonObj);

        var jsonQobj = jsonQ(this.jsonObj);
        console.debug(jsonQobj.find('bank_name').value())
      },
      async searchContents() {
        // console.debug(this.listFolder())
        // this.listFolder();
        await this.sleep(100);
        console.debug(this.$store.state.Directory.contents)
        // console.debug(this.contents);
        // for (let filePath of this.listFolder()) {
        // console.log(filePath);
        // }
      },
      sleep(ms) {
        console.debug("Sleeping for: " + ms)
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    }
  }
</script>

<style scoped>
  .title {
    color: #ffffff;
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