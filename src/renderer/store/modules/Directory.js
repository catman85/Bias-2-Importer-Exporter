const state = {
  isDirSet: false,
  dir: String
}

const mutations = {
  SET_DIR (state, {
    dir
  }) {
    // we do have access to state from here
    // console.debug("trying to " + dir)
    // console.debug(state.dir)
    state.dir = dir
    state.isDirSet = true;
  },
}

const actions = {
  setDir ({ commit },payload) {
    // do something async
    // we don't have access to state from here
    // console.debug("Action payload " + payload);
    commit('SET_DIR',{'dir':payload})
  }
}

export default {
  state,
  actions,
  mutations,
}
