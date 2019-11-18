<template>
    <div>
        <b-card>
            <b-card-img-lazy :src="getThumbnail(preset.preset_uuid)"></b-card-img-lazy>
            <b-card-title @click="changePresetName(preset)">{{preset.preset_name}}</b-card-title>
            <b-card-text>
                <!-- {{preset.display_order}} -->
                {{preset.preset_uuid}}
            </b-card-text>
            <b-badge pill @click="favoriteChange(preset)" :variant="bootBadge(preset.is_favorite)">
                {{bootFav(preset.is_favorite)}}
            </b-badge>
            <b-button-group>
            <b-dropdown dropright size="sm" variant="outline-primary">
                <template v-slot:button-content>
                    <strong>Move</strong> to <em>bank</em>
                </template>
                <!-- ATTENTION if you use this.banksC it won't work -->
                <b-dropdown-item v-for="b in this.banksChild" :key="b.bank_folder" @click='movePresetTo(b,preset)'>
                    {{b.bank_name}}</b-dropdown-item>
            </b-dropdown>


            <b-button variant="outline-info" @click="exportPreset(preset.preset_uuid)">Export</b-button>
            </b-button-group>
            <b-button @click="deletePreset(preset,deleteType.NOTSURE)" variant="outline-danger">Delete</b-button>
            <div @click="changeOrder(direction.UP,preset)">UP</div>
            <div @click="changeOrder(direction.DOWN,preset)">DOWN</div>
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
    import {
        EventBus
    } from '../plugins/event-bus.js';

    const {
        dialog
    } = require('electron').remote

    const fs = require('fs-extra')

    import swal from 'sweetalert';

    export default {
        props: {
            preset: {
                type: Object
            }
        },
        data() {
            return {
                importPresetFunc: this.$parent.importPreset,
                myBankPath: this.selectedBankPath
            }
        },
        methods: {
            callParent() {
                EventBus.$emit('init');
            },
            bootFav(bool) {
                if (bool) {
                    return "favorite"
                } else {
                    return "regular"
                }
            },
            bootBadge(bool) {
                if (bool) {
                    return "warning"
                } else {
                    return "light"
                }
            },
            getThumbnail(uuid) {
                let path = this.nativePath(this.selectedBankPath + '/' + uuid + '/thumbnail.png')
                let logo;
                try {
                    logo = fs.readFileSync(path).toString('base64');
                } catch (err) {

                }
                return 'data:image/png;base64,' + logo
            },
            changePresetName(preset) {
                EventBus.$emit('changeNamePreset', preset);
            },
            async movePresetTo(bank, preset) {
                // console.debug(this.nativePath(this.selectedBankPath + '/'))
                let currBankFolder = this.$store.state.Directory.selectedBankFolder;
                let src = this.nativePath(this.selectedBankPath + '/' + preset.preset_uuid);
                console.debug("Moving " + preset.preset_name + " from " + currBankFolder + " to " + bank
                    .bank_folder)

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
                await this.importPresetFunc(src, bank, this.importType.COPY)
                    .then(() => {
                        console.log('Successfully Copied preset: ' + src + ' to ' + bank)
                        this.deletePreset(preset, this.deleteType.JUSTDOIT)
                    })
                    .catch((err) => {
                        // console.error("3")
                        return this.errorExit(err)
                    })
                    .then(() => {
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
                        EventBus.$emit('init');
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
                let bankQobj = await this.getJsonQObject(this.positiveGridPath + this.bankJsonRelPath, 'utf-8');
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
                await this.updateJson(this.positiveGridPath + this.bankJsonRelPath, bankQobj)
                EventBus.$emit('init');
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
                EventBus.$emit('init');
            },
        }
    }
</script>

<style>

</style>