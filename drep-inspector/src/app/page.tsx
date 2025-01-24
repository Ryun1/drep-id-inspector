"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [features, setFeatures] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setFeatures(`Length: ${value.length}, Uppercase: ${value.toUpperCase()}`); // Example features
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <p className="mb-4">Enter DRep ID</p>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        className="mb-4 p-2 border border-gray-300 rounded"
        placeholder="Enter text"
      />
      {features && (
        <div className="mt-4 p-2 border border-gray-300 rounded">
          {features}
        </div>
      )}
    </div>
  );
}