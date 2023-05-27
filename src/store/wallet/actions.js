import { isLoggedIn, login, logout } from './../../util/auth';
import tzdomains from './../../util/tezos-domains';

const setWallet = async ({ commit, dispatch }, account) => {
  const walletDisplay = `${account.address.substr(0, 6)}...${account.address.substr(-6)}`;

  commit('updateWallet', {
    connected: true,
    pkh: account.address,
    pkhDomain: walletDisplay,
  });

  tzdomains.resolveAddressToName(account.address, walletDisplay).then(res => {
    commit('updateWallet', {
      connected: true,
      pkh: account.address,
      pkhDomain: res,
    });
  });

  dispatch('walletConnected');
};

export default {
  async connectWallet({ commit, state, dispatch }) {
    if (!state.connected) {
      return login().then(async account => {
        if (account) {
          setWallet({ commit, dispatch }, account);
        }
      });
    }
  },

  async disconnectWallet({ commit }) {
    logout().then(() => {
      commit('updateWallet', {
        connected: false,
        pkh: '',
        pkhDomain: '',
      });
    });
  },

  async checkWalletConnected({ commit, dispatch }) {
    isLoggedIn().then(async account => {
      if (account) {
        setWallet({ commit, dispatch }, account);
      }
    });
  },
};
