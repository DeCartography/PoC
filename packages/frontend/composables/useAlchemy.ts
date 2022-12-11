import { Alchemy, Network } from "alchemy-sdk";

const config = useRuntimeConfig();
const alchemyConfig = {
  apiKey: config.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
export const alchemy = new Alchemy(alchemyConfig);
