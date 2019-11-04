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
    <div v-if="checkDirectory">
      <div v-for="b in this.banksC" :key="b.bank_folder">
        <div @click="selectBank(b.bank_folder)">
          {{b.bank_name}}
          {{b.display_order}}
        </div>
        <br>
      </div>
      <br>
    </div>
    Is dir set? {{isDirSet}}<br>
    Dir: {{directory}}<br>
    is dir legit? {{checkDirectory}}<br>
    <div v-if="checkDirectory">
      Selected Bank Folder {{selectedBankFolder}}<br>
      Selected Bank Path {{selectedBankPath}}<br>
      Preset Json Path: {{presetJsonPath}}<br>
    </div>
    <button class="alt" @click='showSaveDialog("wut")'>Open Save Dialog</button>
    <button class="alt" @click='selectPositiveGridFolder()'>Select Folder</button>
    <button class="alt" @click='showStateStuff()'>shot state</button>
    <button class="alt" @click='listFolder(searchContents)'>list</button>
    <div v-for="p in this.presetsC" :key="p.preset_folder">
      <!-- TODO: move up and down delete favorite-->
      <!-- TODO: platform based paths -->
      <div @click="exportPreset(p.preset_uuid)">
        {{p.preset_name}}
        {{p.display_order}}
        {{p.is_favorite}}
        {{p.preset_uuid}}
      </div>
      <div @click="changeOrder(direction.UP,p)">UP</div>
      <div @click="changeOrder(direction.DOWN,p)">DOWN</div>
      <br>
    </div>
  </div>
</template>

<script>
  import {
    mapState,
    mapActions
  } from 'vuex'

  // require('fs')
  const fs = require('fs-extra')
  const {
    dialog
  } = require('electron').remote

  const util = require('util');

  const jsonQ = require("jsonq");

  const readfile = util.promisify(fs.readFile);

  export default {
    data() {
      return {
        electron: process.versions.electron,
        name: this.$route.name,
        node: process.versions.node,
        path: this.$route.path,
        platform: require('os').platform(), // Possible values are: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
        vue: require('vue/package.json').version,
        docPath: require('electron').remote.app.getPath('documents'), // getting native documents path
        contents: Array,
        banks: [],
        presets: [],
        direction: Object.freeze({
          "UP": 0,
          "DOWN": 1
        }),
        // filePathJson: '/home/jim/Documents/bank.json', // String
        bankJsonRelPath: this.nativePath('/BIAS_FX2/GlobalPresets/bank.json')
      }
    },
    mounted() {
      this.init();
    },
    computed: {
      ...mapState({
        count: state => state.Counter.main,
        isDirSet: state => state.Directory.isDirSet,
        selectedBankFolder: state => state.Directory.selectedBankFolder
      }),
      directory: function () {
        if (this.$store.state.Directory.isDirSet) {
          return this.$store.state.Directory.dir;
        } else {
          return this.nativePath(this.docPath + "/Positive Grid");
        }
      },
      banksC: function () {
        return this.banks;
      },
      presetsC: function () {
        return this.presets;
      },
      checkDirectory: function () {
        if (fs.existsSync(this.directory + this.bankJsonRelPath)) {
          console.debug('Found file');
          return true;
        } else {
          console.debug("Didn't find file");
          return false;
        }
      },
      presetJsonPath: function () {
        return this.nativePath(this.directory + '/BIAS_FX2/GlobalPresets/' + this.selectedBankFolder +
        '/preset.json');
      },
      selectedBankPath: function () {
        return this.nativePath(this.directory + '/BIAS_FX2/GlobalPresets/' + this.selectedBankFolder);
      }
    },
    methods: {
      async init() {
        this.banks = await this.getJson(this.directory + this.bankJsonRelPath, 'bank_name')
        this.presets = await this.getJson(this.presetJsonPath, 'preset_name')
      },
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
      selectPositiveGridFolder() {
        dialog.showOpenDialog({
          title: 'Select a folder',
          properties: ['openDirectory']
        }, (folderPaths) => {
          // folderPaths is an array that contains all the selected paths
          if (folderPaths === undefined) {
            console.log('No destination folder selected')
            this.$store.dispatch('setDir', "")
          } else {
            // this.$store.dispatch('SET_DIR', {dir}); // we can't call the mutation directly which can modify the state
            this.$store.dispatch('setDir', folderPaths[0]) // calling the async action which can't modify the state
            console.log(folderPaths)
          }
        })

        this.init();
      },
      showStateStuff() {
        console.debug(this.$store.state.Directory.isDirSet)
        if (this.$store.state.Directory.isDirSet) {
          console.debug(this.$store.state.Directory.dir)
        }
        console.debug(this.$store.state.Directory.selectedBankFolder);
        console.debug(this.$store.state.Directory.contents)
      },
      async selectBank(folderName) {
        console.debug(folderName);
        this.$store.dispatch('setBank', folderName);
        this.init();
      },
      async exportPreset(uuid) {
        console.debug(uuid);
        dialog.showOpenDialog({
          title: 'Select a folder to export the preset to',
          properties: ['openDirectory']
        }, (folderPaths) => {
          // folderPaths is an array that contains all the selected paths
          if (folderPaths === undefined) {
            console.log('No destination folder selected')
          } else {
            let selectedPresetPath = this.selectedBankPath + '/' + uuid;
            let destination = folderPaths[0] + '/' + uuid
            console.debug(selectedPresetPath);
            console.log(destination)

            // copies directory, even if it has subdirectories or files
            fs.copy(selectedPresetPath, destination, {
              overwrite: true
            }, err => {
              if (err) return console.error(err)

              console.log('success!')
            })
          }
        })
      },
      async changeOrder(dir, preset) {
        if (preset.display_order == 0 && dir == this.direction.UP) {
          console.debug("Can't go up")
          return
        } else if ((preset.display_order == this.presets.length - 1) && dir == this.direction.DOWN) {
          console.debug("Can't go down")
          return
        }

        let jsonObj = await readfile(this.presetJsonPath, 'utf-8');
        // console.debug(jsonObj);
        var jsonQobj = jsonQ(jsonObj);
        // console.debug(jsonQobj.find(identifier).value())

        let prev = jsonQobj.find('display_order', function () {
          return this == preset.display_order - 1;
        });
        console.debug(prev.parent().value())

        let curr = jsonQobj.find('display_order', function () {
          return this == preset.display_order;
        });
        console.debug(curr.parent().value())

        let next = jsonQobj.find('display_order', function () {
          return this == preset.display_order + 1;
        });
        console.debug(next.parent().value())
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
        if (callback != undefined) {
          callback(); //searchContents
        }
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
      async getJson(path, identifier) { // Objects are Passed by Reference // Arguments are Passed by Value
        let jsonObj = await readfile(path, 'utf-8');
        // console.debug(jsonObj);

        var jsonQobj = jsonQ(jsonObj);
        // console.debug(jsonQobj.find(identifier).value())

        // getting all elements that have identifier as a property
        let entries = jsonQobj.find(identifier, function () {
          // return this >= 5;
          return this
        }).parent().value();

        // Clearing the array
        let result = [];

        for (let b in entries) {
          result.push(entries[b]);
        }
        console.debug(result)
        return result;
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