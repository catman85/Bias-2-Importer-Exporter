import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

const fs = require('fs-extra')

// const dialog = require('electron').remote

const util = require('util');

const jsonQ = require("jsonq");

const prompt = require('electron-prompt');

const readfile = util.promisify(fs.readFile);

Vue.mixin({
  methods: {
    sleep(ms) {
      console.debug("Sleeping for: " + ms)
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    nativePath(path) {
      // Possible values are: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
      let platform = require('os').platform();
      if(platform === "win32"){
        // console.debug(path.replace(/\//g, "\\"))
        path = path.replace(/\//g, "\\");
      }
      // console.debug("changing Path: " + path + platform)
      return path;
    },
    async getJson(path, identifier) { // Objects are Passed by Reference // Arguments are Passed by Value
      let jsonObj;
      try {
        jsonObj = await readfile(path, 'utf-8');
      } catch (err) {
        console.debug("error path invalid")
        // alert("Error Invalid Path")
        return;
      }

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
      console.debug(result.length) // TODO: empty bank case
      return result;
    },
    showStateStuff() {
      console.debug(this.$store.state.Directory.isDirSet)
      if (this.$store.state.Directory.isDirSet) {
        console.debug(this.$store.state.Directory.dir)
      }
      console.debug(this.$store.state.Directory.selectedBankFolder);
      console.debug(this.$store.state.Directory.contents)
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
    async updateJson(path, content) {
      const writefile = util.promisify(fs.writeFile);
      await writefile(path, content)
        .catch((err) => {
          console.log('Error', err);
          alert(err)
        });
    },
    async getJsonQObject(path,encoding){
      let jsonObj = await readfile(path, encoding);
      return jsonQ(jsonObj);
    }
  },
  data(){
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
  }
})

Vue.filter('filterTest', function(p){ // not in use
    console.debug("changing Path: " + p)
    return p;
});

/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')