export default {
  updateWallet(state, updatedState) {
    state.connected = updatedState.connected;
    state.pkh = updatedState.pkh;
    state.pkhDomain = updatedState.pkhDomain;
  },
};
