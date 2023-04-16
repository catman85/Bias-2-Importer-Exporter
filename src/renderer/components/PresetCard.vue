<template>
  <div>
    <b-card bg-variant="dark" text-variant="white" border-variant="light">
      <b-card-img-lazy
        :src="getThumbnail(preset.preset_uuid)"
      ></b-card-img-lazy>
      <div
        v-b-tooltip.hover.bottom="{ variant: 'info' }"
        title="Rename"
        class="clickable"
      >
        <b-card-title @click="changePresetName(preset)">
          {{ preset.preset_name }}
        </b-card-title>
      </div>
      <b-card-text>
        {{ preset.preset_uuid }}
      </b-card-text>
      <b-badge
        class="clickable"
        pill
        @click="favoriteChange(preset)"
        :variant="bootBadge(preset.is_favorite)"
      >
        {{ bootFav(preset.is_favorite) }}
      </b-badge>
      <br />
      <b-button-group>
        <b-dropdown dropright size="sm" variant="primary">
          <template v-slot:button-content>
            <strong>Move</strong> to <em>bank</em>
          </template>
          <b-dropdown-item
            v-for="b in this.banksChild"
            :key="b.bank_folder"
            @click="movePresetTo(b, preset)"
          >
            {{ b.bank_name }}
          </b-dropdown-item>
        </b-dropdown>

        <b-button variant="info" @click="exportPreset(preset.preset_uuid)"
          >Export</b-button
        >
      </b-button-group>
      <b-button
        @click="deletePreset(preset, deleteType.NOTSURE)"
        variant="danger"
        >Delete</b-button
      >
    </b-card>
  </div>
</template>

<script>
// ATTENTION
// let importPresetFunc = this.$parent.$options.methods.importPreset
// importPresetFunc()
// when the method runs in parent it fucks up the this reference
// and nothing works
// ATTENTION but this works!
// let importPresetFunc = this.$parent.importPreset
// In Vue, the parent-child component relationship can be summarized as props down, events up. The parent passes data down to the child via props, and the child sends messages to the parent via events...
import { EventBus } from "../plugins/event-bus.js";

const { dialog } = require("electron").remote;

const fs = require("fs-extra");

import swal from "sweetalert";

export default {
  props: {
    preset: {
      type: Object,
    },
  },
  data() {
    return {
      importPresetFunc: this.$parent.importPreset,
    };
  },
  methods: {
    callParent() {
      EventBus.$emit("init");
    },
    bootFav(bool) {
      if (bool) {
        return "favorite";
      } else {
        return "regular";
      }
    },
    bootBadge(bool) {
      if (bool) {
        return "warning";
      } else {
        return "light";
      }
    },
    getThumbnail(uuid) {
      let path = this.nativePath(
        this.selectedBankPath + "/" + uuid + "/thumbnail.png"
      );
      let logo;
      try {
        logo = fs.readFileSync(path).toString("base64");
      } catch (err) {}
      return "data:image/png;base64," + logo;
    },
    changePresetName(preset) {
      EventBus.$emit("changeNamePreset", preset);
    },
    async movePresetTo(bank, preset) {
      let currBankFolder = this.$store.state.Directory.selectedBankFolder;
      let src = this.nativePath(
        this.selectedBankPath + "/" + preset.preset_uuid
      );
      console.debug(
        "Moving " +
          preset.preset_name +
          " from " +
          currBankFolder +
          " to " +
          bank.bank_folder
      );

      if (!this.checkIfDirectoriesExists(src)) {
        swal({
          title: "Error",
          text: "The directory " + src + " doesn't exist!",
          icon: "error",
        });
        return this.errorExit("dir doesn't exist");
      }

      if (currBankFolder == bank.bank_folder) {
        swal({
          title: "Error",
          text: "You have to select a different folder to move the preset to!",
          icon: "error",
        });
        return this.errorExit("same src and dest");
      }
      // append to currPresetJson (handled by importPreset)
      await this.importPresetFunc(src, bank, this.importType.COPY)
        .then(() => {
          console.log("Successfully Copied preset: " + src + " to " + bank);
          this.deletePreset(preset, this.deleteType.JUSTDOIT);
        })
        .catch((err) => {
          // console.error("3")
          return this.errorExit(err);
        })
        .then(() => {
          swal(
            "Moved!",
            "You just moved: " + preset.preset_name + "!",
            "success"
          );
        });
    },
    async deletePreset(preset, type) {
      if (type === this.deleteType.NOTSURE) {
        const willDelete = await swal({
          title: "Are you sure?",
          text:
            "Are you sure that you want to delete " + preset.preset_name + "?",
          icon: "warning",
          dangerMode: true,
        });

        if (!willDelete) {
          return;
        }
      }
      let jsonQobj = await this.getJsonQObject(this.presetJsonPath, "utf-8");
      let presetPath = this.nativePath(
        this.selectedBankPath + "/" + preset.preset_uuid
      );
      let presets = jsonQobj.find("LivePresets").value()[0];
      console.debug(presets);

      // removing entry from preset.json
      let oneMissingPreset = presets.filter((value, index, array) => {
        if (value.preset_uuid != preset.preset_uuid) {
          return value;
        }
      });
      jsonQobj.find("LivePresets").value((val) => {
        return oneMissingPreset;
      });
      console.debug("One Missing Preset: " + preset.preset_name);
      console.debug(jsonQobj.find("LivePresets").value()[0]);

      await this.updateJson(this.presetJsonPath, jsonQobj)
        .then((res) => {
          this.remove(presetPath);
        })
        .then((res) => {
          EventBus.$emit("init");
        })
        .catch((err) => {
          return this.errorExit(err);
        });
      if (type === this.deleteType.NOTSURE) {
        swal(
          "Deleted!",
          "You just deleted: " + preset.preset_name + "!",
          "success"
        );
      }
    },
    async favoriteChange(preset) {
      let jsonQobj = await this.getJsonQObject(this.presetJsonPath, "utf-8");
      let bankQobj = await this.getJsonQObject(
        this.positiveGridPath + this.bankJsonRelPath,
        "utf-8"
      );
      let favorites = bankQobj.find("Favorites").value()[0];

      // searching for an entry with our preset id
      let curr = jsonQobj
        .find("preset_uuid", function () {
          return this === preset.preset_uuid;
        })
        .parent();

      curr.find("is_favorite").value(function (bool) {
        return !bool;
      });

      // we also need to modify the bank.json file
      if (curr.find("is_favorite").value()[0]) {
        // if it just became a fav
        bankQobj.find("Favorites").append(preset.preset_uuid);
      } else {
        // if it was just removed from fav
        let newFav = favorites.filter((value, index, array) => {
          if (value != preset.preset_uuid) {
            return value;
          }
        });
        // removing the entry from bank.json
        bankQobj.find("Favorites").value((val) => {
          return newFav;
        });
      }
      await this.updateJson(this.presetJsonPath, jsonQobj);
      await this.updateJson(
        this.positiveGridPath + this.bankJsonRelPath,
        bankQobj
      );
      EventBus.$emit("init");
    },
    async exportPreset(uuid) {
      dialog.showOpenDialog(
        {
          title: "Select a folder to export the preset to",
          properties: ["openDirectory"],
        },
        async (folderPaths) => {
          // folderPaths is an array that contains all the seleclted paths
          if (!folderPaths)
            return console.log("No destination folder selected");
          let selectedPresetPath = this.nativePath(
            this.selectedBankPath + "/" + uuid
          );
          let destination = this.nativePath(folderPaths[0] + "/" + uuid);
          console.debug(selectedPresetPath);
          console.log(destination);

          await this.copyFromTo(selectedPresetPath, destination).then(() => {
            swal(
              "Success!",
              "You just exported: " + uuid + " to " + destination + " !",
              "success"
            );
          });
        }
      );
    },
  },
};
</script>

<style></style>
