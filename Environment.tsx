import { Environment } from '@react-three/drei';

export function MeeBotScene() {
  return (
    <>
      {/* ระบบจะวิ่งไปหาที่ public/hdri/ โดยอัตโนมัติเมื่อรันบนเบราว์เซอร์ */}
      <Environment 
        files="/hdri/dikhololo_night_1k.hdr",
        background 
        blur={0.05} // เพิ่มความฟุ้งของพื้นหลังเล็กน้อยเพื่อให้หุ่นยนต์ดูเด่นขึ้น
      />
      {/* ใส่โมเดล MeeBot ของคุณที่นี่ */}
    </>
  );
}