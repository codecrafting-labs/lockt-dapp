import { createStore, createLogger } from "vuex";
import wallet from "./wallet";
import locks from "./locks";

const debug = import.meta.env.DEV;

export default createStore({
  modules: {
    wallet: wallet,
    locks: locks,
  },
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
