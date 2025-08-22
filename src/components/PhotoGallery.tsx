"use client";

import { PhotoWithAccess } from "@/types";
import { formatPrice } from "@/lib/pricing";
import PhotoCard from "./PhotoCard";

interface PhotoGalleryProps {
  photos: PhotoWithAccess[];
  selectedPhotoIds: string[];
  onTogglePhoto: (photoId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  totalSelected: number;
  pricePerPhoto: number;
  totalPrice: number;
  savings: {
    savings: number;
    savingsPerPhoto: number;
    percentageSaved: number;
  };
  allSelected: boolean;
  noneSelected: boolean;
  isUpdating: boolean;
  onUnlock?: () => void;
  showUnlockButton?: boolean;
}

export default function PhotoGallery({
  photos,
  selectedPhotoIds,
  onTogglePhoto,
  onSelectAll,
  onDeselectAll,
  totalSelected,
  pricePerPhoto,
  totalPrice,
  savings,
  allSelected,
  noneSelected,
  isUpdating,
  onUnlock,
  showUnlockButton = false,
}: PhotoGalleryProps) {
  const anyUnlocked = photos.some((photo) => photo.access?.is_unlocked);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header with selection controls */}
      <div className="card p-8 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <div>
              <h3
                className="text-2xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Ready to unlock {totalSelected > 0 ? totalSelected : "your"}{" "}
                photo
                {totalSelected !== 1 && totalSelected > 0
                  ? "s"
                  : totalSelected === 1
                    ? ""
                    : "s"}
                ?
              </h3>
              <p
                className="text-base mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                📧 High-resolution photos delivered straight to your inbox
              </p>

              {/* Continue button */}
              {showUnlockButton && totalSelected > 0 && onUnlock && (
                <button
                  onClick={onUnlock}
                  disabled={isUpdating}
                  className="btn text-lg p-8 rounded-xl transition-all transform hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary) 0%, #3e6bdc 100%)",
                    color: "white",
                    border: "none",
                    boxShadow: "0 8px 24px rgba(187, 74, 146, 0.3)",
                    opacity: isUpdating ? "0.5" : "1",
                    cursor: isUpdating ? "not-allowed" : "pointer",
                  }}
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="text-base font-medium w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <span className="flex text-base font-medium items-center space-x-2">
                      <span className="hidden">
                        Get photos - {formatPrice(totalPrice)}
                      </span>
                      <span>Get photos</span>
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Pricing Summary on Right */}
          {totalSelected > 0 && (
            <div
              className="rounded-xl p-4 min-w-64"
              style={{
                background: "var(--secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="text-sm font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {totalSelected} × {formatPrice(pricePerPhoto)}
              </div>
              <div
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {formatPrice(totalPrice)}
              </div>
              {savings.savings > 0 && (
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--success)" }}
                >
                  Save {formatPrice(savings.savings)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {photos.map((photo, index) => {
          const isSelected = selectedPhotoIds.includes(photo.id);
          const isUnlocked = photo.access?.is_unlocked || false;

          return (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={index}
              isSelected={isSelected}
              isUnlocked={isUnlocked}
              isUpdating={isUpdating}
              pricePerPhoto={pricePerPhoto}
              onTogglePhoto={onTogglePhoto}
            />
          );
        })}
      </div>

      {/* No photos selected message */}
      {noneSelected && photos.length > 0 && (
        <div className="text-center py-12">
          <div
            className="card p-8 max-w-md mx-auto"
            style={{ borderColor: "var(--warning)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255, 159, 10, 0.1)" }}
            >
              <span className="text-3xl">📷</span>
            </div>
            <p
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              No photos selected
            </p>
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              Select at least one photo to continue with your purchase.
            </p>
          </div>
        </div>
      )}

      {/* Download section for unlocked photos */}
      {anyUnlocked && (
        <div className="mt-12">
          <div
            className="card p-8"
            style={{
              borderColor: "var(--success)",
              background: "rgba(48, 209, 88, 0.05)",
            }}
          >
            <div className="flex items-center mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                style={{ background: "var(--success)" }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3
                className="text-2xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Ready to Download
              </h3>
            </div>
            <p
              className="text-lg mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Your purchased photos are ready for download. Click on individual
              photos above or use the buttons below.
            </p>
            <div className="flex flex-wrap gap-4">
              {photos
                .filter((photo) => photo.access?.is_unlocked)
                .map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => {
                      window.open(
                        `/api/download/${photo.bib_number}?photo_id=${photo.id}`,
                        "_blank"
                      );
                    }}
                    className="btn"
                    style={{
                      background: "var(--success)",
                      color: "white",
                      padding: "0.75rem 1.5rem",
                      boxShadow: "0 4px 12px rgba(187, 74, 146, 0.3)",
                    }}
                  >
                    Download Photo #{index + 1}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
