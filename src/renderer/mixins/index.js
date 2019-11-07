const fs = require('fs-extra')
const util = require('util');
const jsonQ = require("jsonq");
const prompt = require('electron-prompt');
const readfile = util.promisify(fs.readFile);

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
            presets: [],
        }
    },
    methods: {
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
        async listFolder(dirPath, callback) {
            const readdir = util.promisify(fs.readdir);

            // fs.readdir(this.directory, (err, dir) => {
            // for (let filePath of dir) {
            // console.log(filePath);
            // }
            // });
            let contents;
            try {
                contents = await readdir(dirPath) // ls
            } catch (err) {
                console.log(err);
            }
            if (contents === undefined) {
                console.log('undefined');
            } else {
                console.log(contents);
            }
            // console.debug(this.contents);
            this.$store.dispatch('setContents', contents);
            // console.debug(cons);
            // return cons;
            // return contents;
            // console.debug("Hello");
            if (callback != undefined) {
                callback(); //searchContents
            }
        },
        async getJson(path, identifier) { // Objects are Passed by Reference // Arguments are Passed by Value
            let jsonQobj = await this.getJsonQObject(path,'utf-8')
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
            // console.debug(result)
            // console.debug(result.length)
            return result;
        },
        async updateJson(path, content) {
            const writefile = util.promisify(fs.writeFile);
            await writefile(path, content)
              .catch((err) => {
                console.log('Error', err);
                alert(err)
              });
          },
          async getJsonQObject(path,encoding){
            let jsonObj = await readfile(path, encoding)
            .catch((err)=>{
                console.debug('Error',err)
                alert(err)
            })

            return jsonQ(jsonObj);
          }
    }
}

export default myMixins