"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BibInput from "@/components/BibInput";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleBibSubmit = async (bib: string) => {
    setLoading(true);
    setError("");

    try {
      // Check if photo exists for this bib number
      const response = await fetch(`/api/photos/${bib}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to find photo");
      }

      if (data.success && data.data) {
        // Photo found, navigate to photo preview page
        router.push(`/photo/${bib}`);
      } else {
        setError(
          "No photo found for this bib number. Please check your number and try again."
        );
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Hero Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1524646349956-1590eacfa324?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Marathon runners during race"
          fill
          className="object-cover"
          priority
        />
        {/* Photo Credit */}
        <div className="absolute bottom-4 left-4 text-xs text-white/80 bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
          Photo by{" "}
          <a
            href="https://unsplash.com/@peterampazzo?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white transition-colors"
          >
            Pietro Rampazzo
          </a>{" "}
          on{" "}
          <a
            href="https://unsplash.com/photos/people-watching-padova-marathon-during-daytime-x5GcXFvJJhI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white transition-colors"
          >
            Unsplash
          </a>
        </div>
      </div>

      {/* Right Column - Content */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <div className="w-full max-w-xl px-8 py-12">
          {/* Header */}
          <div className="mb-12 text-center lg:text-left">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start mb-8">
              <Image
                src="/logo.png"
                alt="Logo"
                width={200}
                height={67}
                className="h-20 w-auto"
                priority
              />
            </div>
            <h1
              className="text-4xl sm:text-5xl font-bold mb-6"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}
            >
              Get Your Race Photo
            </h1>
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Enter your bib number to find and purchase your professional race
              photo. High-resolution downloads available for just $10.
            </p>
          </div>

          {/* Bib Input */}
          <div className="mb-12">
            <BibInput
              onSubmit={handleBibSubmit}
              loading={loading}
              error={error}
            />
          </div>

          {/* How it works - Simplified */}
          {/* <div className="mb-12">
            <h2
              className="text-xl font-semibold mb-6 text-center lg:text-left"
              style={{ color: "var(--text-primary)" }}
            >
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--primary)" }}
                >
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Enter your bib number
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--primary)" }}
                >
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Complete a quick survey
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--primary)" }}
                >
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Purchase and download instantly
                </p>
              </div>
            </div>
          </div> */}

          {/* Features - Simplified */}
          {/* <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏆</span>
              <div>
                <h3
                  className="font-medium text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Professional Quality
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  High-resolution photos by race photographers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">⚡</span>
              <div>
                <h3
                  className="font-medium text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Instant Download
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Download immediately after purchase
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">💰</span>
              <div>
                <h3
                  className="font-medium text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Affordable Pricing
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Just $10 per photo with bulk discounts
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
