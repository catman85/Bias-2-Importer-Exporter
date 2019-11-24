// import {
//     remove
// } from 'fs-extra-p';
// import {
//     rejects
// } from 'assert';

// https://github.com/jprichardson/node-fs-extra
const fs = require('fs-extra')
const util = require('util');
const jsonQ = require("jsonq");
const prompt = require('electron-prompt');
const readfile = util.promisify(fs.readFile);
const writefile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);
const { shell } = require('electron');

import {
    mapState
} from 'vuex'
import {
    EventBus
} from '../plugins/event-bus.js';

const myMixins = {
    data() {
        return {
            electron: process.versions.electron,
            name: this.$route.name,
            node: process.versions.node,
            path: this.$route.path,
            platform: require('os').platform(), // Possible values are: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
            vue: require('vue/package.json').version,
            docPath: require('electron').remote.app.getPath('documents'), // getting native documents path
            bankJsonRelPath: this.nativePath('/BIAS_FX2/GlobalPresets/bank.json'),
            banks: [],
            presets: null,
            objType: Object.freeze({ // enum
                "BANK": 0,
                "PRESET": 1
            }),
            importType: Object.freeze({ // enum
                "MOVE": 0,
                "COPY": 1
            }),
            deleteType: Object.freeze({ // enum
                "JUSTDOIT": 0,
                "NOTSURE": 1
            }),
            direction: Object.freeze({
                "UP": 0,
                "UP": 1
            })
        }
    },
    computed: { // having global computed properties renders vuex store useless but whatever
        ...mapState({
            isDirSet: state => state.Directory.isDirSet,
            selectedBankFolder: (state) => {
                if(!state.Directory.selectedBankFolder){
                    // return this default path the first time
                    return 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
                }
                return state.Directory.selectedBankFolder
            },
            banksChild: state => state.Directory.banks
        }),
        positiveGridPath: function () {
            if (this.$store.state.Directory.isDirSet) {
                return this.$store.state.Directory.dir;
            } else {
                return this.nativePath(this.docPath + "/PositiveGrid");
            }
        },
        checkMainDirectoryValidity: function () {
            return this.checkIfDirectoriesExists(this.positiveGridPath + this.bankJsonRelPath)
        },
        presetJsonPath: function () {
            return this.nativePath(this.positiveGridPath + '/BIAS_FX2/GlobalPresets/' + this.selectedBankFolder +
                '/preset.json');
        },
        selectedBankPath: function () {
            // ATTENTION everytime the main dir or selected bank is changed we trigger an UI change
            // ATTENTION we need to put this property in template to trigger a change
            // EventBus.$emit('init');
            
            return this.nativePath(this.positiveGridPath + '/BIAS_FX2/GlobalPresets/' + this.selectedBankFolder);
        }
    },
    methods: {
        openLinkInDefaultBrowser(url){
            shell.openExternal(url)
        },
        showStateStuff() {
            console.debug(this.$store.state.Directory.isDirSet)
            if (this.$store.state.Directory.isDirSet) {
                console.debug(this.$store.state.Directory.dir)
            }
            console.debug(this.$store.state.Directory.selectedBankFolder);
            console.debug(this.$store.state.Directory.contents)
        },
        sleep(ms) {
            console.debug("Sleeping for: " + ms)
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        nativePath(path) {
            // Possible values are: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
            let platform = require('os').platform();
            if (platform === "win32") {
                // console.debug(path.replace(/\//g, "\\"))
                path = path.replace(/\//g, "\\");
            }
            // console.debug("changing Path: " + path + platform)
            return path;
        },
        getLastPartOfPath(path) {
            // works for both win and mac
            return path.split('\\').pop().split('/').pop();
        },
        async listFolder(dirPath, callback) {
            // classic way
            // fs.readdir(this.directory, (err, dir) => {
            // for (let filePath of dir) {
            // console.log(filePath);
            // }
            // });
            let contents;
            try {
                contents = await readdir(dirPath) // ls
            } catch (err) {
                return this.errorExit(err)
            }

            if (contents === undefined) {
                console.log('undefined');
            } else {
                console.log(contents);
            }

            if (callback != undefined) {
                callback(); //searchContents
            }
        },
        async getJson(path, identifier) { // Objects are Passed by Reference // Arguments are Passed by Value
            // Clearing the array
            let result = [];
            let entries

            await this.getJsonQObject(path, 'utf-8')
                .catch(err => {
                    return this.errorExit(err)
                })
                .then((res) => { // res is jsonQ Object
                    // getting all elements that have identifier as a property
                    entries = res.find(identifier, function () {
                        // return this >= 5;
                        return this
                    }).parent().value();
                })
            // console.debug(jsonQobj.find(identifier).value())
            for (let b in entries) {
                result.push(entries[b]);
            }
            // console.debug(result)
            // console.debug(result.length)
            return result;
        },
        async updateJson(path, jsonQobj) {
            let content = JSON.stringify(jsonQobj.value()[0])
            await writefile(path, content)
                .catch((err) => {
                    return this.errorExit(err)
                });
        },
        async getJsonQObject(path, encoding) {
            let jsonObj = await readfile(path, encoding)
                .catch((err) => {
                    return this.errorExit(err)
                })

            return jsonQ(jsonObj);

        },
        checkIfDirectoriesExists(...paths) {
            // console.debug(paths)
            let bool = true
            for (let i in paths) {
                if (fs.existsSync(paths[i])) { // this.directory + this.bankJsonRelPath
                    // console.debug('Found file');
                } else {
                    console.debug("Didn't find file, exiting");
                    // return false;
                    bool = false;
                    break;
                }
            }
            return bool
        },
        async copyFromTo(source, dest) {
            // copies directory, even if it has subdirectories or files
            await fs.copy(source, dest, {
                overwrite: true
            }).catch(err => {
                console.error("1")
                return this.errorExit(err)
            })
        },
        async moveFromTo(src, dest) { // unused
            try {
                await fs.move(src, dest, {
                    overwrite: true
                })
                console.log('success!')
            } catch (err) {
                return this.errorExit(err)
            }
        },
        async remove(path) {
            fs.remove(path)
                .then((res) => {
                    console.log('success removing: ' + path)
                    return this.successResolve(res)
                })
                .catch(err => {
                    return this.errorExit(err)
                })
        },
        async asyncForEach(array, callback) {
            // ATTENTION classic forEach is not async compatible
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array)
                .catch((err)=>{
                    return this.errorExit(err)
                });
                // we dont use index or array
                // we only use arra[index]    (file)
            }
        },
        errorExit(err) { // ATTENTION the function that uses this must await
            return new Promise((resolve, reject) => {
                reject(err)
            })
        },
        successResolve(res) { // ATTENTION the function that uses this must await
            return new Promise((resolve, reject) => {
                resolve(res)
            })
        }
    }
}

export default myMixins