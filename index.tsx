/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// 🟢 เปลี่ยนการ Import ให้ตรงกับชื่อใน Import Map
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // มั่นใจว่าใส่ .tsx หรือเช็คว่ามีไฟล์ App ใน src

// ✅ ปรับปรุง Polyfill ให้คลอบคลุมระบบที่ใช้ใน DApp
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { 
    env: { 
      NODE_ENV: 'development',
      // ดึงค่าจาก Import Meta (ของ Vite) มาใส่เพื่อให้ AI และ Contract ทำงานได้
      API_KEY: (procss as any).env?.VITE_GEMINI_API_KEY || '' 
    } 
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// 🚀 ยิง Render ไปที่ Root
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
