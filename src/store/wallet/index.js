import actions from "./actions";
import mutations from "./mutations";

export default {
  state: {
    connected: false,
    network: import.meta.env.VITE_TEZOS_NETWORK,
    pkh: "",
    pkhDomain: "",
  },
  actions,
  mutations,
};
