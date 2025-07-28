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
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="bib"
            className="block text-lg font-medium mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Enter your bib number
          </label>
          <input
            type="text"
            id="bib"
            value={bib}
            onChange={handleChange}
            placeholder="e.g. 1234"
            className="input text-xl text-center font-medium tracking-wider"
            style={{
              fontSize: '1.5rem',
              padding: '1rem 1.5rem',
              minHeight: '60px',
              borderRadius: '16px',
              letterSpacing: '0.1em'
            }}
            disabled={loading}
            autoFocus
            maxLength={20}
          />
          {(validationError || error) && (
            <p className="mt-3 text-sm font-medium" style={{ color: 'var(--danger)' }}>
              {validationError || error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !bib.trim()}
          className="btn btn-primary w-full text-lg font-semibold"
          style={{
            padding: '1rem 2rem',
            minHeight: '56px',
            fontSize: '1.125rem',
            opacity: (loading || !bib.trim()) ? '0.5' : '1',
            cursor: (loading || !bib.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Searching...</span>
            </div>
          ) : (
            "Find My Photo"
          )}
        </button>
      </form>
    </div>
  );
}
