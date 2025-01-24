"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [features, setFeatures] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState("Enter DRep ID");

  const isValidDRepID = (value: string): boolean => {
    // DRep ID regex pattern
    // they start with drep1 (at length of 56 or 58) or drep_script1 (at length of 63)
    const drepIDPattern = /^(drep1[a-zA-Z0-9]{51,53}|drep_script1[a-zA-Z0-9]{52})$/;
    return drepIDPattern.test(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (!isValidDRepID(value)) {
      setFeatures(null);
      return;
    }

    // Example features
    setFeatures(`Valid DRep ID. Length: ${value.length}`);
  };

  const handleFocus = () => {
    setPlaceholder("");
  };

  const handleBlur = () => {
    setPlaceholder("drep1y29h...");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <p className="mb-4">DRep ID Inspector</p>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="mb-4 p-2 border border-gray-300 rounded"
        placeholder={placeholder}
      />
      {features && (
        <div className="mt-4 p-2 border border-gray-300 rounded">
          {features}
        </div>
      )}
    </div>
  );
}