"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SurveyForm from "@/components/SurveyForm";
import PhotoDisplay from "@/components/PhotoDisplay";
import { PhotosWithSelections, SurveyFormData } from "@/types";
import { formatPrice } from "@/lib/pricing";

interface UnlockPageProps {
  params: Promise<{
    bib: string;
  }>;
}

export default function UnlockPage({ params }: UnlockPageProps) {
  const [photosData, setPhotosData] = useState<PhotosWithSelections | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [surveyError, setSurveyError] = useState("");
  const router = useRouter();
  const { bib } = use(params);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(`/api/photos/${bib}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load photos");
        }

        if (data.success && data.data) {
          setPhotosData(data.data);

          // If all photos are already unlocked, redirect to photo page
          const allUnlocked = data.data.photos.every(
            (photo: any) => photo.access?.is_unlocked
          );
          if (allUnlocked && data.data.photos.length > 0) {
            router.push(`/photo/${bib}`);
            return;
          }
        } else {
          setError("No photos found");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [bib, router]);

  const selectedPhotoIds =
    photosData?.selections
      ?.filter((selection) => selection.is_selected)
      ?.map((selection) => selection.photo_id) || [];

  const selectedPhotos =
    photosData?.photos?.filter((photo) =>
      selectedPhotoIds.includes(photo.id)
    ) || [];

  const handleSurveySubmit = async (data: SurveyFormData) => {
    setSurveyLoading(true);
    setSurveyError("");

    try {
      if (selectedPhotoIds.length === 0) {
        setSurveyError("No photos selected. Please go back and select photos.");
        setSurveyLoading(false);
        return;
      }

      const response = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          bib_number: bib,
          selected_photo_ids: selectedPhotoIds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit survey");
      }

      // Survey submitted successfully, now proceed to payment
      await handlePayment();
    } catch (err: any) {
      setSurveyError(err.message || "Failed to submit survey");
    } finally {
      setSurveyLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bib_number: bib,
          selected_photo_ids: selectedPhotoIds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create payment session");
      }

      // Redirect to Stripe Checkout
      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-6">
            <div
              className="w-full h-full border-3 rounded-full animate-spin"
              style={{
                borderColor: "var(--border)",
                borderTopColor: "var(--primary)",
                borderWidth: "3px",
              }}
            ></div>
          </div>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error || !photosData || selectedPhotoIds.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="max-w-md mx-auto text-center">
          <div className="card p-8" style={{ borderColor: "var(--danger)" }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255, 69, 58, 0.1)" }}
            >
              <span className="text-2xl">
                {selectedPhotoIds.length === 0 ? "📷" : "❌"}
              </span>
            </div>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              {selectedPhotoIds.length === 0 ? "No Photos Selected" : "Error"}
            </h2>
            <p
              className="text-base mb-6 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {selectedPhotoIds.length === 0
                ? "Please go back and select at least one photo to continue."
                : error || "Something went wrong."}
            </p>
            <button
              onClick={() => router.push(`/photo/${bib}`)}
              className="btn btn-primary"
            >
              {selectedPhotoIds.length === 0
                ? "Back to Photo Selection"
                : "Back to Photos"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = surveyLoading || paymentLoading;
  const totalPrice = photosData.totalPrice;
  const pricePerPhoto = photosData.pricePerPhoto;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="container mx-auto px-6 py-12">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image
            src="/logo.png"
            alt="Logo"
            width={200}
            height={67}
            className="h-20 w-auto"
            priority
          />
        </div>
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push(`/photo/${bib}`)}
              className="btn btn-secondary"
              style={{ padding: "0.75rem 1.5rem" }}
            >
              ← Back to Photos
            </button>
            <div
              className="px-4 py-2 rounded-full"
              style={{
                background: "var(--secondary)",
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              Bib #{bib}
            </div>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Unlock Your Photos
          </h1>
          <p
            className="text-xl leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Complete a quick survey and payment to unlock{" "}
            {selectedPhotoIds.length} high-resolution photo
            {selectedPhotoIds.length !== 1 ? "s" : ""} for{" "}
            {formatPrice(totalPrice)}.
          </p>
        </div>

        {/* Selected Photos Summary */}
        {/* <div className="max-w-4xl mx-auto mb-12">
          <div className="card p-8">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
              Selected Photos ({selectedPhotoIds.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              {selectedPhotos.slice(0, 10).map((photo, index) => (
                <div key={photo.id} className="relative aspect-square">
                  <PhotoDisplay
                    photo={photo}
                    index={selectedPhotos.findIndex(p => p.id === photo.id)}
                    isUnlocked={false}
                  />
                </div>
              ))}
              {selectedPhotos.length > 10 && (
                <div className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center"
                     style={{ 
                       background: 'var(--secondary)', 
                       borderColor: 'var(--border)' 
                     }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    +{selectedPhotos.length - 10} more
                  </span>
                </div>
              )}
            </div>
            <div className="rounded-2xl p-6" 
                 style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                    {selectedPhotoIds.length} photo{selectedPhotoIds.length !== 1 ? 's' : ''} × {formatPrice(pricePerPhoto)} each
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Total: {formatPrice(totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Survey Form */}
        <div className="max-w-4xl mx-auto">
          <SurveyForm
            onSubmit={handleSurveySubmit}
            loading={isLoading}
            error={surveyError}
          />
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="card p-8 max-w-sm mx-4 text-center">
              <div className="w-12 h-12 mx-auto mb-6">
                <div
                  className="w-full h-full border-3 rounded-full animate-spin"
                  style={{
                    borderColor: "var(--border)",
                    borderTopColor: "var(--primary)",
                    borderWidth: "3px",
                  }}
                ></div>
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {paymentLoading
                  ? "Processing Payment..."
                  : "Submitting Survey..."}
              </h3>
              <p
                className="text-base"
                style={{ color: "var(--text-secondary)" }}
              >
                {paymentLoading
                  ? "Please wait while we redirect you to payment."
                  : "Please wait while we process your survey."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
