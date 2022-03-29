import { request } from "./../../util/api";

export default {
  async refreshLocks({ commit }) {
    commit("updateLocksLoading", true);
    request.get("/user/locks").then((res) => {
      commit("updateLocks", res.data);
      commit("updateLocksLoading", false);
    });
  },

  async deleteLock({ dispatch }, lockId) {
    request.delete(`/user/lock/${lockId}`).then(() => {
      dispatch("refreshLocks");
    });
  },

  async walletConnected({ dispatch }) {
    dispatch("refreshLocks");
  },
};
