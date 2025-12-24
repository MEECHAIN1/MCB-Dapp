import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { meeChain } from "../meeChain"; // ✅ เชื่อมกับไฟล์ลงทะเบียน Chain ของคุณ
import { mainnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "MeeBot Ritual",
  projectId: "b0d81328f8ab0541fdede7db9ff25cb1", // ✅ นี่คือ ID ที่คุณลงทะเบียนไว้
  chains: [meeChain, mainnet], // ✅ เพิ่ม MeeChain เข้าไปในรายการที่รองรับ
  transports: {
    [meeChain.id]: http(), // ✅ ใช้ RPC ตามที่ตั้งค่าใน meeChain.ts
    [mainnet.id]: http(),
  },
  ssr: false,
});