<template>
    <div>
        <div @click="selectBank(bank.bank_folder)">
            {{bank.bank_name}}
            {{bank.display_order}}
        </div>
        <div @click="selectPresetsDialog(bank)">Import Presets</div>
        <div @click="$parent.showNewNamePrompt(bank)">rename bank</div>
        <br>
    </div>
</template>


<script>
    const {
        dialog
    } = require('electron').remote

    export default {
        props: {
            bank: {
                type: Object
            }
        },
        methods: {
            async selectBank(folderName) {
                // const dispatch = util.promisify(this.$store.dispatch);
                console.debug(folderName);
                // triggers init()
                this.$store.dispatch('setBank', folderName)
                // await this.sleep(50) // FIXME:
                // this.$parent.init();
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
                        var funct = this.$parent.importPreset
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
        }
    }
</script>

<style>

</style>