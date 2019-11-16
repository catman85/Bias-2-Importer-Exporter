<template>
  <div>
    Is dir set? {{isDirSet}}<br>
    is dir legit? {{checkMainDirectoryValidity}}<br>
    Dir: {{positiveGridParh}}<br>
    <div v-if="checkMainDirectoryValidity">
      Selected Bank Path: {{selectedBankPath}}<br>
      Preset Json Path: {{presetJsonPath}}<br>
    </div>
    <system-information></system-information>
    <div v-if="checkMainDirectoryValidity">
      <div v-for="b in this.banks" :key="b.bank_folder">
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
    <button class="alt" @click='selectPositiveGridFolder()'>Select Folder</button>
    <button class="alt" @click='showStateStuff()'>shot state</button>
    <button class="alt" @click='listFolder(positiveGridParh)'>list</button>

    <div v-if="this.presets.length">
      <div show v-for="p in this.presets" :key="p.preset_folder">
        <!-- TODO: move to bank -->
        <b-dropdown dropright size="sm" variant="outline-primary">
          <template v-slot:button-content>
            <strong>Move</strong> to <em>bank</em>
          </template>
          <!-- ATTENTION if you use this.banksC it won't work -->
          <b-dropdown-item show v-for="b in banks" :key="b.bank_folder" @click='movePresetTo(b,p)'>
            {{b.bank_name}}
          </b-dropdown-item>
        </b-dropdown>
        <div @click="exportPreset(p.preset_uuid)">
          {{p.display_order}}
          {{p.preset_uuid}}
        </div>
        <div @click="showNewNamePrompt(p)">{{p.preset_name}}</div>
        <div @click="favoriteChange(p)">
          {{p.is_favorite}}
        </div>
        <div @click="deletePreset(p,deleteType.NOTSURE)">DELETE</div>
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
  // const fs = require('fs-extra')

  import {
    mapState,
    mapActions
  } from 'vuex'
  import {
    rename
  } from 'fs';

  import swal from 'sweetalert';
  // require('fs')
  // const fs = require('fs-extra')
  const {
    dialog
  } = require('electron').remote

  import SystemInformation from '@/components/LandingPage/SystemInformation.vue'

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
        }),
        importType: Object.freeze({
          "MOVE": 0,
          "COPY": 1
        }),
        deleteType: Object.freeze({
          "JUSTDOIT": 0,
          "NOTSURE": 1
        })
      }
    },
    components: {
      SystemInformation
    },
    mounted() {
      // you could use async computed properties instead
      this.init();
      // this.$root.$on('bv::dropdown::show', bvEvent => {
      //   console.log('Dropdown is about to be shown', bvEvent)
      // })
    },
    computed: {
      ...mapState({
        count: state => state.Counter.main, // just for educational purposes
        isDirSet: state => state.Directory.isDirSet,
        selectedBankFolder: (state) => {
          // this.init()
          return state.Directory.selectedBankFolder
        }
      }),
      positiveGridParh: function () {
        if (this.$store.state.Directory.isDirSet) {
          return this.$store.state.Directory.dir;
        } else {
          return this.nativePath(this.docPath + "/PositiveGrid");
        }
      },
      checkMainDirectoryValidity: function () {
        return this.checkIfDirectoriesExists(this.positiveGridParh + this.bankJsonRelPath)
      },
      presetJsonPath: function () {
        return this.nativePath(this.positiveGridParh + '/BIAS_FX2/GlobalPresets/' + this.selectedBankFolder +
          '/preset.json');
      },
      selectedBankPath: function () {
        this.init() // ATTENTION everytime the main dir or selected bank is changed we trigger an UI change
        return this.nativePath(this.positiveGridParh + '/BIAS_FX2/GlobalPresets/' + this.selectedBankFolder);
      }
    },
    methods: {
      async init() {
        console.debug("Init running")
        // these cause a flash
        // this.banks = []
        // this.presets = []
        this.banks = await this.getJson(this.positiveGridParh + this.bankJsonRelPath, 'bank_name')
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
      async selectBank(folderName) {
        // const dispatch = util.promisify(this.$store.dispatch);
        console.debug(folderName);
        // triggers init()
        this.$store.dispatch('setBank', folderName)
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
      async movePresetTo(bank, preset) {
        let currBankFolder = this.$store.state.Directory.selectedBankFolder;
        let src = this.nativePath(this.selectedBankPath + '/' + preset.preset_uuid)
        // console.debug("Moving " + preset.preset_name + " from " + currBankFolder + " to " + bank.bank_folder)

        if (!this.checkIfDirectoriesExists(src)) {
          swal({
            title: "Error",
            text: "The directory " + src + " doesn't exist!",
            icon: "error"
          })
          return this.errorExit("dir doesn't exist");
        }

        if (currBankFolder == bank.bank_folder) {
          swal({
            title: "Error",
            text: "You have to select a different folder to move the preset to!",
            icon: "error"
          })
          return this.errorExit("same src and dest")
        }
        // append to currPresettJson (handled by importPreset)
        await this.importPreset(src, bank, this.importType.COPY)
          .then(() => {
            console.log('Successfully Copied preset: ' + src + ' to ' + bank)
            this.deletePreset(preset, this.deleteType.JUSTDOIT)
          })
          .catch((err) => {
            // console.error("3")
            return this.errorExit(err)
          })
          .then(()=>{
            swal("Moved!", "You just moved: " + preset.preset_name + "!", "success");
          })
      },
      async deletePreset(preset, type) {
        if (type === this.deleteType.NOTSURE) {
          const willDelete = await swal({
            title: "Are you sure?",
            text: "Are you sure that you want to delete" + preset.preset_name + "?",
            icon: "warning",
            dangerMode: true,
          });

          if (!willDelete) {
            return
          }
        }
        let jsonQobj = await this.getJsonQObject(this.presetJsonPath, 'utf-8');
        let presetPath = this.nativePath(this.selectedBankPath + '/' + preset.preset_uuid);
        let presets = jsonQobj.find('LivePresets').value()[0]
        console.debug(presets)

        // removing entry from preset.json
        let oneMissingPreset = presets.filter((value, index, array) => {
          if (value.preset_uuid != preset.preset_uuid) {
            return value;
          }
        })
        jsonQobj.find('LivePresets').value((val) => {
          return oneMissingPreset;
        })
        console.debug("One Missing Preset: " + preset.preset_name)
        console.debug(jsonQobj.find('LivePresets').value()[0])

        await this.updateJson(this.presetJsonPath, jsonQobj)
          .then(res => {
            this.remove(presetPath)
          })
          .then(res => {
            this.init();
          })
          .catch(err => {
            return this.errorExit(err)
          });
        if (type === this.deleteType.NOTSURE) {
          swal("Deleted!", "You just deleted: " + preset.preset_name + "!", "success");
        }
      },
      async favoriteChange(preset) {
        let jsonQobj = await this.getJsonQObject(this.presetJsonPath, 'utf-8');
        let bankQobj = await this.getJsonQObject(this.positiveGridParh + this.bankJsonRelPath, 'utf-8');
        let favorites = bankQobj.find('Favorites').value()[0]

        // searching for an entry with our preset id
        let curr = jsonQobj.find('preset_uuid', function () {
          return this === preset.preset_uuid
        }).parent();

        curr.find('is_favorite').value(function (bool) {
          return !bool;
        });

        // we also need to modify the bank.json file
        if (curr.find('is_favorite').value()[0]) {
          // if it just became a fav
          bankQobj.find('Favorites').append(preset.preset_uuid)
        } else {
          // if it was just removed from fav
          let newFav = favorites.filter((value, index, array) => {
            if (value != preset.preset_uuid) {
              return value
            }
          })
          // removing the entry from bank.json
          bankQobj.find('Favorites').value((val) => {
            return newFav;
          })
        }

        console.debug(bankQobj.value()[0])
        await this.updateJson(this.presetJsonPath, jsonQobj)
        await this.updateJson(this.positiveGridParh + this.bankJsonRelPath, bankQobj)
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
          path = this.positiveGridParh + this.bankJsonRelPath
        }

        if (type === this.objType.PRESET) {
          let metaPath = this.nativePath(this.selectedBankPath + '/' + obj.preset_uuid + '/meta.json')
          if (!this.checkIfDirectoriesExists(metaPath)) {
            alert("meta.json file for: " + obj.preset_name + " not found in: " + metaPath)
            return;
          }
          let metaQobj = await this.getJsonQObject(metaPath, 'utf-8');
          metaQobj.find('name').value(() => {
            return newName;
          })
          await this.updateJson(metaPath, metaQobj);
        }


        let jsonQobj = await this.getJsonQObject(path, 'utf-8');

        // searching for an entry with out preset id
        curr = jsonQobj.find(idAttribute, function () {
          return this === id
        }).parent();

        curr.find(nameAttribute).value(function (name) {
          return newName;
        });

        await this.updateJson(path, jsonQobj)
        this.init();
      },
      async changeOrder(dir, preset) { // useless
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
        await this.updateJson(this.presetJsonPath, jsonQobj)
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
            var type = this.importType.COPY
            // func reference accessible in nameless func
            // problems with closures if we use importPreset directly it wont work
            this.asyncForEach(folderPaths,
              async function (path) {
                // console.debug(path)
                await funct(path, bank, type)
              });
          }
        })
      },
      async importPreset(path, bank, importType) {
        let pathMeta = this.nativePath(path + '/meta.json')
        let pathData = this.nativePath(path + '/data.json')

        if (!this.checkIfDirectoriesExists(pathData, pathMeta)) {
          alert("Invalid Preset Folder: " + path)
          return this.errorExit("bad preset folder")
        }
        let newUUID = this.getLastPartOfPath(path)
        let selBankPath = this.nativePath(this.positiveGridParh + '/BIAS_FX2/GlobalPresets/' + bank.bank_folder)
        let presetJsonPathSelBank = this.nativePath(selBankPath + '/preset.json');
        let dest = this.nativePath(selBankPath + '/' + newUUID)

        console.debug("Importing Preset... " + newUUID)
        console.debug("To json file ... " + presetJsonPathSelBank)
        if (importType == this.importType.COPY) {
          console.debug("Copying from: " + path + " to " + dest)
          await this.copyFromTo(path, dest).catch(err => {
            console.error("error from import preset")
            return this.errorExit(err) // this needs the await in mama function to work
          })
        } else { // unused
          console.debug("Moving from: " + path + " to " + dest)
          await this.moveFromTo(path, dest).catch(err => {
            return this.errorExit(err)
          })
        }


        let newPreQobj = await this.getJsonQObject(pathMeta, 'utf-8')
        let newPresetName = newPreQobj.find('name').value()[0]

        let currBankQobj = await this.getJsonQObject(presetJsonPathSelBank, 'utf-8')
        let newDisplayOrder = currBankQobj.find('LivePresets').value()[0].length;

        let newEntry = {
          "display_order": newDisplayOrder,
          "is_favorite": false,
          "preset_name": newPresetName,
          "preset_uuid": newUUID
        }

        currBankQobj.find('LivePresets').append(newEntry);
        // console.debug(currBankQobj.value())

        await this.updateJson(presetJsonPathSelBank, currBankQobj)
        this.init()
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