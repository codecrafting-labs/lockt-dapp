import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { SigningType } from "@airgap/beacon-sdk";
import { Tzip12Module } from "@taquito/tzip12";
import { Tzip16Module } from "@taquito/tzip16";

const Tezos = new TezosToolkit(import.meta.env.VITE_TEZOS_RPC_URL);

Tezos.addExtension(new Tzip12Module());
Tezos.addExtension(new Tzip16Module());

const wallet = new BeaconWallet({
  name: import.meta.env.VITE_TEZOS_DAPP_NAME,
  preferredNetwork: import.meta.env.VITE_TEZOS_NETWORK,
  colorMode: "light",
  featuredWallets: ["temple", "kukai", "naan", "umami"],
});

// Setting the wallet as the wallet provider for Taquito.
Tezos.setWalletProvider(wallet);

const network = {
  type: import.meta.env.VITE_TEZOS_NETWORK,
  rpcUrl: import.meta.env.VITE_TEZOS_RPC_URL,
};

const signMessage = async (msg, address) => {
  msg = "Tezos Signed Message: " + msg;
  const input = Buffer.from(msg); // eslint-disable-line no-undef
  const prefix = Buffer.from("0501", "hex"); // eslint-disable-line no-undef
  // eslint-disable-next-line no-undef
  const len_bytes = Buffer.from(
    msg.length.toString(16).padStart(8, "0"),
    "hex"
  );

  // eslint-disable-next-line no-undef
  msg = Buffer.concat(
    [prefix, len_bytes, input],
    prefix.length + len_bytes.length + input.length
  );

  // Bytes to hex
  msg = msg.toString("hex");

  let signedMsg = false;
  try {
    signedMsg = (
      await wallet.client.requestSignPayload({
        signingType: SigningType.MICHELINE,
        payload: msg,
        sourceAddress: address,
      })
    ).signature;
  } catch (signPayloadError) {
    console.error(signPayloadError);
  }

  return { msg, signedMsg };
};

const signLoginRequest = async () => {
  const acct = await getActiveAccount();
  return await signMessage(
    JSON.stringify({
      type: "auth",
      name: import.meta.env.VITE_TEZOS_DAPP_NAME,
      pkh: await acct.address,
      expires: new Date().getTime() + 5 * 60 * 1000,
    }),
    acct.address
  );
};

const hasActiveAccount = async () => wallet.client.getActiveAccount();

const getActiveAccount = async () => {
  const activeAccount = await hasActiveAccount();

  // no active account, we need permissions first
  if (!activeAccount) {
    await wallet.requestPermissions({ network });
    return getActiveAccount();
  }

  return activeAccount;
};

const clearActiveAccount = async () => wallet.client.clearActiveAccount();

export {
  Tezos,
  wallet,
  getActiveAccount,
  hasActiveAccount,
  clearActiveAccount,
  signLoginRequest,
  signMessage,
};
