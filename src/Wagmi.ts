import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { meeChain } from "../meeChain"; // นำเข้าจากไฟล์ที่คุณตั้งค่าไว้
import { mainnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "MeeBot Ritual",
  // ✅ ใช้ Project ID ที่คุณเพิ่งลงทะเบียนมา
  projectId: "2e0008e23308df1a8278a35195822b65", 
  chains: [meeChain, mainnet], 
  transports: {
    [meeChain.id]: http(), 
    [mainnet.id]: http(),
  },
  ssr: false,
});
