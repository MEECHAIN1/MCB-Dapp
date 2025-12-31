/**
 * MeeBot Ritual Parts Manifest
 * Defines the visual components for robot assembly in the Gallery.
 */
export const parts = {
  heads: [
    { id: 'h1', name: 'Nexus Prime', rarity: 'Common', power: 10 },
    { id: 'h2', name: 'Cyber Occult', rarity: 'Rare', power: 25 },
    { id: 'h3', name: 'Ritual Crown', rarity: 'Legendary', power: 50 }
  ],
  bodies: [
    { id: 'b1', name: 'Steel Ritualist', health: 100 },
    { id: 'b2', name: 'Void Chassis', health: 250 },
    { id: 'b3', name: 'Celestial Armor', health: 500 }
  ],
  arms: [
    { id: 'a1', name: 'Standard Gripper' },
    { id: 'a2', name: 'Plasma Injector' },
    { id: 'a3', name: 'Oracle Blade' }
  ]
};

// ฟังก์ชันสำหรับสุ่มชิ้นส่วน (ถ้าคุณต้องการใช้ในหน้า Mint)
export const getRandomPart = (category: keyof typeof parts) => {
  const categoryParts = parts[category];
  return categoryParts[Math.floor(Math.random() * categoryParts.length)];
};