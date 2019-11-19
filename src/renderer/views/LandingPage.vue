<template>
  <div>
    <div class="split left" v-if="checkMainDirectoryValidity">
      <div v-for="b in this.banks" :key="b.bank_folder">
        <bank-card :bank="b"></bank-card>
      </div>
      <br>
    </div>

    <div class="split right">
      <div v-if="!this.presets" class="center-text">
        <b-spinner variant="primary" label="Spinning"></b-spinner>
      </div>
      <div v-else>
        <div v-if="this.presets.length" class="pre-wrapper">
          <div v-for="p in this.presets" :key="p.preset_folder">
            <preset-card :preset="p"></preset-card>
            <br>
          </div>
        </div>
        <div v-else-if="this.presets.length === 0">
          <p>No Presets in this folder</p>
        </div>
      </div>
    </div>

    <!-- ATTENTION we use this to trigger the computed property -->
    <!-- <div style="visibility: hidden;">{{this.selectedBankPath}}</div> -->
  </div>
</template>

<script>
  import {
    EventBus
  } from '../plugins/event-bus.js';

  import swal from 'sweetalert';

  const {
    dialog
  } = require('electron').remote


  import BankCard from '@/components/BankCard.vue'
  import PresetCard from '@/components/PresetCard.vue'

  const util = require('util');

  const prompt = require('electron-prompt');

  export default {
    components: {
      BankCard,
      PresetCard
    },
    mounted() {
      // you could use async computed properties instead
      this.init();

      // this.$root.$on('bv::dropdown::show', bvEvent => {
      //   console.log('Dropdown is about to be shown', bvEvent)
      // })
      console.debug(this.selectedBankFolder)

      EventBus.$on('init', () => {
        this.init()
      });

      EventBus.$on('changeNamePreset', (preset) => {
        this.showNewNamePrompt(preset);
      });
    },
    methods: {
      async init() {
        console.debug("Init running")
        // these cause a flash
        // this.banks = []
        // this.presets = []
        this.banks = await this.getJson(this.positiveGridPath + this.bankJsonRelPath, 'bank_name')
        this.$store.dispatch('setBanks', this.banks)
        this.presets = await this.getJson(this.presetJsonPath, 'preset_name')
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
          path = this.positiveGridPath + this.bankJsonRelPath
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
      async importPreset(path, bank, importType) {
        let pathMeta = this.nativePath(path + '/meta.json')
        let pathData = this.nativePath(path + '/data.json')

        if (!this.checkIfDirectoriesExists(pathData, pathMeta)) {
          alert("Invalid Preset Folder: " + path)
          return this.errorExit("bad preset folder")
        }
        let newUUID = this.getLastPartOfPath(path)
        let selBankPath = this.nativePath(this.positiveGridPath + '/BIAS_FX2/GlobalPresets/' + bank.bank_folder)
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