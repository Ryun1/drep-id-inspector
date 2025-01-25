"use client";

import React, { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState("");
  const [features, setFeatures] = useState<string[] | null>(null);
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

    const features = [];

    // decode DRep ID from Bech32
    const bech32 = require('bech32-buffer');
    const decodedBech32Bytes = bech32.decode(value).data;
    const hexEncodedID = Buffer.from(decodedBech32Bytes).toString('hex');

    let isCIP105;
    let isScriptBased;

    // Is DRep ID CIP-105 or CIP-129?
    if (hexEncodedID.length === 56) {
      isCIP105 = true;
      features.push("Standard: CIP-105");
    } else if (hexEncodedID.length === 58) {
      isCIP105 = false;
      features.push("Standard: CIP-129");
    }

    // Is DRep ID key-based or script-based?
    if (value.startsWith("drep_script1")) {
      isScriptBased = true;
      features.push("Type: Script-based");
      // is CIP129 and hex starts with 23
    } else if (!isCIP105 && hexEncodedID.startsWith("23")) {
      isScriptBased = true;
      features.push("Type: Script-based");
    } else {
      isScriptBased = false;
      features.push("Type: Key-based");
    }

    // Add hex to features
    if (isCIP105) {
      features.push(`Hex: ${'  '+hexEncodedID}`);
    } else {
      features.push(`Hex: ${hexEncodedID}`);
    }

    // Add alternative encoding to features
    if (isCIP105) {
      if (isScriptBased) {
        features.push(`CIP-129: ${bech32.encode("drep", Buffer.from( '23' + hexEncodedID, 'hex')).toString()}`);
      } else {
        features.push(`CIP-129: ${bech32.encode("drep", Buffer.from('22' + hexEncodedID, 'hex')).toString()}`);
      }
    } else {
      if (isScriptBased) {
        features.push(`CIP-105: ${bech32.encode("drep_script1", Buffer.from(hexEncodedID.slice(2), 'hex')).toString()}`);
      } else {
        features.push(`CIP-105: ${bech32.encode("drep", Buffer.from(hexEncodedID.slice(2), 'hex')).toString()}`);
      }
    }

    setFeatures(features);
};

  const handleFocus = () => {
    setPlaceholder("");
  };

  const handleBlur = () => {
    setPlaceholder("drep1y29...");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <p className="mb-4">DRep Inspector</p>
      <div className="flex flex-col items-center">
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
          <ul className="fixed-features">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}