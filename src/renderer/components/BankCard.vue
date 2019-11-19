<template>
    <div @click="selectBank(bank.bank_folder)" class="clickable">
        <b-card bg-variant="dark" text-variant="white" class="bank-card" :border-variant="amITheCurrentBank(bank.bank_folder)">
            
                <b-card-title class="center-text" @click="$parent.showNewNamePrompt(bank)">
                    <div v-b-tooltip.hover title="Rename Bank" class="bank-card-title">
                    {{bank.bank_name}}
                    </div>
                    <!-- {{bank.display_order}} -->
                </b-card-title>
            <b-card-footer>

                <b-button @click="selectPresetsDialog(bank)">Import Presets</b-button>
                <!-- <b-button >Rename Bank</b-button> -->
            </b-card-footer>

        </b-card>
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
            amITheCurrentBank(folder){
                if(folder == this.selectedBankFolder){
                    return 'warning'
                }else{
                    return 'light'
                }     
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