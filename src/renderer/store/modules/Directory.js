// import { resolve } from "path";

const state = {
  isDirSet: false,
  dir: String,
  contents: Array,
  selectedBankFolder: String
}

const mutations = {
  SET_DIR(state, {dir}) {
      // we do have access to state from here
      // console.debug(state.dir)
      state.dir = dir;
      if (dir == "") { // nothing selected
        state.isDirSet = false;
      } else {
        state.isDirSet = true
      }
  },
  SET_CONTENTS(state, {contents}) { // not used
    state.contents = contents
  },
  SET_BANK(state, {bankFolder}) {
    state.selectedBankFolder = bankFolder
  }
}

const actions = {
  setDir({commit}, payload) {
    // do something async
    // we don't have access to state from here
    commit('SET_DIR', {
      'dir': payload
    })
  },
  setContents({commit}, payload) {
    commit('SET_CONTENTS', {
      'contents': payload
    })
  },
  setBank({commit}, payload) {
    // I can't make this work
    // https://stackoverflow.com/questions/42195971/how-can-i-get-response-of-this-store-dispatch-on-the-vue-js-2
    commit('SET_BANK', {
      'bankFolder': payload
    })
  }
}

export default {
  state,
  actions,
  mutations
}