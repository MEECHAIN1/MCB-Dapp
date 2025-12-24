import { http } from "wagmi";
import { meeChain } from "./meeChain";
import { mainnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "MeeBot Ritual",
  projectId: "2e0008e23308df1a8278a35195822b65",
  chains: [meeChain, mainnet],
  transports: {
    [meeChain.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: false,
});