"use client";

import { useState } from "react";
import { validateBibNumber } from "@/lib/utils";

interface BibInputProps {
  onSubmit: (bib: string) => void;
  loading?: boolean;
  error?: string;
}

export default function BibInput({
  onSubmit,
  loading = false,
  error,
}: BibInputProps) {
  const [bib, setBib] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bib.trim()) {
      setValidationError("Please enter your bib number");
      return;
    }

    if (!validateBibNumber(bib)) {
      setValidationError("Bib number must be alphanumeric and 1-20 characters");
      return;
    }

    setValidationError("");
    onSubmit(bib.trim().toUpperCase());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBib(value);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="bib"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter your bib number
          </label>
          <input
            type="text"
            id="bib"
            value={bib}
            onChange={handleChange}
            placeholder="e.g. 1234"
            className="dark:text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center"
            disabled={loading}
            autoFocus
            maxLength={20}
          />
          {(validationError || error) && (
            <p className="mt-2 text-sm text-red-600">
              {validationError || error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !bib.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? "Searching..." : "Find My Photo"}
        </button>
      </form>
    </div>
  );
}
