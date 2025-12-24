import React from 'react';

export const TailwindTestPage: React.FC = () => {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-indigo-600">🎨 Tailwind Utility Test</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-500 text-white p-4 rounded shadow">bg-blue-500</div>
        <div className="bg-green-500 text-white p-4 rounded shadow">bg-green-500</div>
        <div className="border border-red-500 p-4 rounded">border-red-500</div>
        <div className="text-center text-lg font-semibold">text-center + font-semibold</div>
        <div className="hover:bg-yellow-300 transition p-4 rounded">hover:bg-yellow-300</div>
        <div className="flex items-center justify-center h-24 bg-gray-100">flex + center</div>
      </div>

      <button className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
        ✨ Test Button
      </button>
    </div>
  );
};

export default TailwindTestPage;
