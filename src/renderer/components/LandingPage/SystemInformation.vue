<template>
  <div>
    Is dir set? {{isDirSet}}<br>
    is dir legit? {{checkMainDirectoryValidity}}<br>
    Dir: {{directory}}<br>
    <div v-if="checkMainDirectoryValidity">
      Selected Bank Path: {{selectedBankPath}}<br>
      Preset Json Path: {{presetJsonPath}}<br>
    </div>
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
    <div v-if="checkMainDirectoryValidity">
      <div v-for="b in this.banksC" :key="b.bank_folder">
        <div @click="selectBank(b.bank_folder)">
          {{b.bank_name}}
          {{b.display_order}}
        </div>
        <div @click="selectPresetsDialog(b)">Import Presets</div>
        <div @click="showNewNamePrompt(b)">rename bank</div>
        <br>
      </div>
      <br>
    </div>
    <button class="alt" @click='showSaveDialog("wut")'>Open Save Dialog</button>
    <button class="alt" @click='selectPositiveGridFolder()'>Select Folder</button>
    <button class="alt" @click='showStateStuff()'>shot state</button>
    <button class="alt" @click='listFolder(directory)'>list</button>

    <div v-if="this.presetsC.length">
      <div v-for="p in this.presetsC" :key="p.preset_folder">
        <!-- TODO: move to bank -->
        <div @click="exportPreset(p.preset_uuid)">

          {{p.display_order}}
          {{p.preset_uuid}}
        </div>
        <div @click="showNewNamePrompt(p)">{{p.preset_name}}</div>
        <div @click="favoriteChange(p)">
          {{p.is_favorite}}
        </div>
        <div @click="changeOrder(direction.UP,p)">UP</div>
        <div @click="changeOrder(direction.DOWN,p)">DOWN</div>
        <br>
      </div>
    </div>
    <div v-else>
      <br>
      <p>No presets in this folder</p>
    </div>
  </div>
</template>

<script>
  const fs = require('fs-extra')

  import {
    mapState,
    mapActions
  } from 'vuex'
  import {
    rename
  } from 'fs';

  // require('fs')
  // const fs = require('fs-extra')
  const {
    dialog
  } = require('electron').remote

  const util = require('util');

  const prompt = require('electron-prompt');

  export default {
    data() {
      return {
        direction: Object.freeze({
          "UP": 0,
          "DOWN": 1
        }),
        objType: Object.freeze({
          "BANK": 0,
          "PRESET": 1
        })
      }
    },
    mounted() {
      // you could use async computed properties instead
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
          return this.nativePath(this.docPath + "/PositiveGrid");
        }
      },
      checkMainDirectoryValidity: function () {
        return this.checkIfDirectoriesExists(this.directory + this.bankJsonRelPath)
      },
      banksC: function () {
        return this.banks;
      },
      presetsC: function () {
        return this.presets;
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
      async selectPositiveGridFolder() {
        dialog.showOpenDialog({
          title: 'Select a folder',
          properties: ['openDirectory']
        }, async (folderPaths) => {
          // folderPaths is an array that contains all the selected paths
          if (folderPaths === undefined) {
            console.log('No destination folder selected')
            this.$store.dispatch('setDir', "")
          } else {
            // this.$store.dispatch('SET_DIR', {dir}); 
            // we can't call the mutation directly which can modify the state
            this.$store.dispatch('setDir', folderPaths[
              0]) // calling the async action which can't modify the state
            console.log(folderPaths)
          }
          await this.sleep(200) // FIXME: not cool
          await this.init();
        })
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
      async selectBank(folderName) {
        console.debug(folderName);
        await this.$store.dispatch('setBank', folderName)
        // .then(()=>{ // not working
        // this.init();
        // });
        await this.sleep(100); // FIXME: not cool
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
            return;
          } else {
            let selectedPresetPath = this.nativePath(this.selectedBankPath + '/' + uuid);
            let destination = this.nativePath(folderPaths[0] + '/' + uuid);
            console.debug(selectedPresetPath);
            console.log(destination)

            this.copyFromTo(selectedPresetPath, destination)
          }
        })
      },
      async favoriteChange(preset) {
        let jsonQobj = await this.getJsonQObject(this.presetJsonPath, 'utf-8');

        // searching for an entry with out preset id
        let curr = jsonQobj.find('preset_uuid', function () {
          return this === preset.preset_uuid
        }).parent();

        curr.find('is_favorite').value(function (bool) {
          return !bool;
        });

        this.updateJson(this.presetJsonPath, jsonQobj)
        this.init();
      },
      async showNewNamePrompt(obj) {
        // figuring out the type of the object
        let type, title, oldValue
        if (obj.preset_name) {
          type = this.objType.PRESET;
          title = 'preset\'s';
          oldValue = obj.preset_name;
        } else {
          type = this.objType.BANK;
          title = 'bank\'s';
          oldValue = obj.bank_name;
        }

        prompt({
            title: 'Please enter the ' + title + ' new name:',
            label: 'New name:',
            value: oldValue,
            inputAttrs: {
              type: 'name'
            },
            type: 'input'
          })
          .then((r) => {
            if (r === null) {
              console.log('user cancelled');
              return;
            } else {
              console.log('result', r);
              this.changeName(r, obj, type);
            }
          })
          .catch(console.error);
      },
      async changeName(newName, obj, type) {
        let curr, id, idAttribute, nameAttribute, path
        if (type === this.objType.PRESET) {
          id = obj.preset_uuid
          idAttribute = 'preset_uuid'
          nameAttribute = 'preset_name'
          path = this.presetJsonPath
        } else {
          id = obj.bank_folder
          idAttribute = 'bank_folder'
          nameAttribute = 'bank_name'
          path = this.directory + this.bankJsonRelPath
        }

        let jsonQobj = await this.getJsonQObject(path, 'utf-8');

        // searching for an entry with out preset id
        curr = jsonQobj.find(idAttribute, function () {
          return this === id
        }).parent();

        curr.find(nameAttribute).value(function (name) {
          return newName;
        });

        this.updateJson(path, jsonQobj)
        this.init();
      },
      async changeOrder(dir, preset) {
        if (preset.display_order == 0 && dir == this.direction.UP) {
          console.debug("Can't go up")
          return
        } else if ((preset.display_order == this.presets.length - 1) && dir == this.direction.DOWN) {
          console.debug("Can't go down")
          return
        }

        let jsonQobj = await this.getJsonQObject(this.presetJsonPath, 'utf-8');

        // finding siblings
        let prev = jsonQobj.find('display_order', function () {
          return this === preset.display_order - 1;
        });
        // console.debug(prev.parent().value())

        let curr = jsonQobj.find('display_order', function () {
          return this === preset.display_order;
        });
        // console.debug(curr.parent().value())

        let next = jsonQobj.find('display_order', function () {
          return this === preset.display_order + 1;
        });
        // console.debug(next.parent().value())

        // let c = curr.find('display_order').value()[0]
        // let p = prev.find('display_order').value()[0]

        // modifying siblings
        if (dir == this.direction.UP) {
          curr.value(function (order) {
            return order - 1;
          })

          prev.value(function (order) {
            return order + 1;
          })
        }
        if (dir == this.direction.DOWN) {
          curr.value(function (order) {
            return order + 1;
          })

          next.value(function (order) {
            return order - 1;
          })
        }

        // sorting based on display order
        jsonQobj.sort('display_order')

        // console.debug(jsonQobj.value()[0]);
        this.updateJson(this.presetJsonPath, jsonQobj)
        this.init();
      },
      async selectPresetsDialog(bank) {
        dialog.showOpenDialog({
          title: 'Select presets to import',
          properties: ['openDirectory', 'multiSelections']
        }, async (folderPaths) => {
          // folderPaths is an array that contains all the selected paths
          if (folderPaths === undefined) {
            console.log('No preset folders selected')
            return;
          } else {
            var funct = this.importPreset 
            // func reference accessible in nameless func
            // problems with closures if we use importPreset directly it wont work
            this.asyncForEach(folderPaths,
              async function (path) {
                // console.debug(path)
                await funct(path, bank)
              });
          }
        })
      },
      async importPreset(path, bank) {
        console.debug(bank.bank_folder)
        let pathMeta = this.nativePath(path + '/meta.json')
        let pathData = this.nativePath(path + '/data.json')
        if (!this.checkIfDirectoriesExists(pathData, pathMeta)) {
          alert("Invalid Preset Folder: " + path)
          return false;
        }
        let newUUID = this.getLastPartOfPath(path)
        console.debug("Importing Preset... " + newUUID)

        let dest = this.nativePath(this.selectedBankPath + '/' + newUUID)
        await this.copyFromTo(path, dest)

        let newPreQobj = await this.getJsonQObject(pathMeta, 'utf-8')
        let newPresetName = newPreQobj.find('name').value()[0]

        // TODO: dont use presetJsonPath use the b object instead
        let currBankQobj = await this.getJsonQObject(this.presetJsonPath, 'utf-8')
        let newDisplayOrder = currBankQobj.find('LivePresets').value()[0].length;

        let newEntry = {
          "display_order": newDisplayOrder,
          "is_favorite": false,
          "preset_name": newPresetName,
          "preset_uuid": newUUID
        }

        currBankQobj.find('LivePresets').append(newEntry);
        console.debug(currBankQobj.value())

        await this.updateJson(this.presetJsonPath, currBankQobj)
        this.init()
        return true;
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