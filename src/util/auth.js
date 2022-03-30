import {
  isLoggedIn as isJwtLoggedIn,
  setAuthTokens,
  clearAuthTokens,
} from "axios-jwt";
import * as api from "./api";
import * as Tezos from "./tezos";

const isLoggedIn = async () =>
  isJwtLoggedIn() && (await Tezos.hasActiveAccount());

// login
const login = async () => {
  if (await isLoggedIn()) {
    return isLoggedIn();
  }

  const activeAccount = await Tezos.getActiveAccount();

  const { msg, signedMsg } = await Tezos.signLoginRequest();

  const req = { msg: msg, sig: signedMsg, pubKey: activeAccount.publicKey };

  const res = await api.request.post("/auth", req);

  // save tokens to storage
  if (res && res.data && res.data.access_token && res.data.refresh_token) {
    setAuthTokens({
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
    });
  }

  return isLoggedIn();
};

const T = () => {
  let t = localStorage.getItem("auth-tokens-production"),
    o;
  if (!t) {
    t = localStorage.getItem("auth-tokens-development");
  }
  try {
    o = JSON.parse(t);
    return o.accessToken;
  } catch (e) {
    console.warn("Unauthorized", e);
    return "";
  }
};

// to reset auth tokens
const logout = async () => {
  clearAuthTokens();
  await Tezos.clearActiveAccount();
};

export { isLoggedIn, T, login, logout };
