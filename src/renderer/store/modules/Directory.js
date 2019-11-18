// ATTENTION Remember that mutations have to be synchronous. Actions don't. We can perform asynchronous operations inside an action:

import {
  EventBus
} from '@/plugins/event-bus.js';
const state = {
  isDirSet: false,
  dir: String,
  banks: Array,
  selectedBankFolder: String
}

const mutations = {
  SET_DIR(state, {
    dir
  }) {
    // we do have access to state from here
    // console.debug(state.dir)
    state.dir = dir;
    if (dir == "") { // nothing selected
      state.isDirSet = false;
    } else {
      state.isDirSet = true
    }
    // refresh UI
    EventBus.$emit('init');
  },
  SET_BANKS(state, {
    banks
  }) { // not used
    state.banks = banks
  },
  SET_BANK(state, {
    bankFolder
  }) {

    state.selectedBankFolder = bankFolder
    // refresh UI
    EventBus.$emit('init');
  }

}

const actions = {
  setDir({
    commit
  }, payload) {
    // do something async
    // we don't have access to state from here
    commit('SET_DIR', {
      'dir': payload
    })
  },
  setBanks({
    commit
  }, payload) {
    commit('SET_BANKS', {
      'banks': payload
    })
  },
  setBank({
    commit
  }, payload) {
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