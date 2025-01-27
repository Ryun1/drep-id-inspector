"use client";

import React, { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState("");
  const [features, setFeatures] = useState<string[] | null>(null);
  const [placeholder, setPlaceholder] = useState("Enter DRep ID");

  const isValidDRepID = (bechID: string): boolean => {
    // DRep ID regex pattern
    // they start with drep1 (at length of 56 or 58) or drep_script1 (at length of 63)
    const drepIDPattern = /^(drep1[a-zA-Z0-9]{51,53}|drep_script1[a-zA-Z0-9]{52})$/;
    return drepIDPattern.test(bechID);
  };

  const decodeDRepIDToHex = (bechID: string): string => {
    // decode DRep ID from Bech32 to hex
    const bech32 = require('bech32-buffer');
    const decodedBytes = bech32.decode(bechID).data;
    const hex = Buffer.from(decodedBytes).toString('hex');
    return hex;
  };

  const isHexIDCIP105 = (hexID: string): boolean => {
    // Use the length of the hex ID to determine if CIP-105 or CIP-129?
    // if length is 56 then CIP-105, if 58 then CIP-129
    if (hexID.length === 56) {
      return true;
    } else if (hexID.length === 58) {
      return false;
    }
    throw new Error('Invalid hex encoded DRep ID length. Must be 56 or 58 characters.');
  }

  const isBechIDScriptBased = (bech32: string, isCIP105: boolean): boolean => {
    // Is DRep ID key-based or script-based?
    // Use CIP105 bech32 prefix to determine if script-based
    const hexEncodedID = decodeDRepIDToHex(bech32);
    if (bech32.startsWith("drep_script1")) {
      return true;
      // if CIP-129 and 23 then its script-based
    } else if (!isCIP105 && hexEncodedID.startsWith("23")) {
      return true;
      // else is CIP105 key-based OR is CIP-129 and 22 then its key-based
    } else {
      return false;
    }
  }

  const hexToBech32 = (hexID: string, isScript?: boolean): string => {
    const bech32 = require('bech32-buffer');
    const isCIP105 = isHexIDCIP105(hexID);
    // if we are encoding a CIP105 hex ID
    // use different prefixes for CIP105 script-based and key-based
    if (isCIP105) {
      if (isScript) {
        return bech32.encode("drep_script", Buffer.from(hexID, 'hex')).toString();
      } else {
        return bech32.encode("drep", Buffer.from(hexID, 'hex')).toString();
      }
    // else we are encoding a CIP129 hex ID
    } else {
      return bech32.encode("drep", Buffer.from(hexID, 'hex')).toString();
    }
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // exit function if input is not a bech32 DRep ID
    if (!isValidDRepID(value)) {
      setFeatures(null);
      return;
    }

    const bechEncodedID = value;
    const hexEncodedID = decodeDRepIDToHex(bechEncodedID);

    const isCIP105 = isHexIDCIP105(hexEncodedID);
    const isScriptBased = isBechIDScriptBased(bechEncodedID, isCIP105);

    const features = [];

    // Add to list of features the standard used
    if (isCIP105) {
      features.push("Standard: CIP-105");
    } else if (!isCIP105) {
      features.push("Standard: CIP-129");
    }

    // Add to list if the ID is script based or key based
    if (isScriptBased) {
      features.push("Type: Script-based");
    } else if (isScriptBased) {
      features.push("Type: Script-based");
    } else {
      features.push("Type: Key-based");
    }

    // Add the hex representation to the outputted features
    if (isCIP105) {
      features.push(`Hex: ${'  '+hexEncodedID}`);
    } else {
      features.push(`Hex: ${hexEncodedID}`);
    }

    // Add alternative encoding to features
    // if provided ID is CIP105 then output CIP129
    if (isCIP105) {
      // if provided ID is CIP105 then add CIP129 prefix before encoding
      // if script-based then add 23 prefix, else use 22 prefix
      if (isScriptBased) {
        features.push(`CIP-129: ${hexToBech32('23' + hexEncodedID)}`);
      } else {
        features.push(`CIP-129: ${hexToBech32('22' + hexEncodedID)}`);
      }
    // if provided ID is CIP129 then output CIP105 
    // by removing respective prefix and then encoding
    } else {
      // remove the 22 or 23 prefix
      features.push(`CIP-105: ${hexToBech32(hexEncodedID.slice(2), isScriptBased)}`);
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