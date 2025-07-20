'use client';

import Image from 'next/image';
import { PhotoWithAccess } from '@/types';
import { formatPrice } from '@/lib/pricing';

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
  const anyUnlocked = photos.some(photo => photo.access?.is_unlocked);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header with selection controls */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your Race Photos ({photos.length} photo{photos.length !== 1 ? 's' : ''})
            </h2>
            <div className="flex gap-4">
              <button
                onClick={allSelected ? onDeselectAll : onSelectAll}
                disabled={isUpdating}
                className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
              {!allSelected && !noneSelected && (
                <button
                  onClick={onDeselectAll}
                  disabled={isUpdating}
                  className="text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          {totalSelected > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 min-w-64">
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {totalSelected} photo{totalSelected !== 1 ? 's' : ''} selected
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatPrice(pricePerPhoto)} each
                </div>
                <div className="text-xl font-bold text-gray-900">
                  Total: {formatPrice(totalPrice)}
                </div>
                {savings.savings > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    Save {formatPrice(savings.savings)} ({savings.percentageSaved}% off)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Unlock button */}
        {showUnlockButton && totalSelected > 0 && onUnlock && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={onUnlock}
              disabled={isUpdating}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              {isUpdating ? 'Updating...' : `Continue with ${totalSelected} photo${totalSelected !== 1 ? 's' : ''} - ${formatPrice(totalPrice)}`}
            </button>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo, index) => {
          const isSelected = selectedPhotoIds.includes(photo.id);
          const isUnlocked = photo.access?.is_unlocked || false;

          return (
            <div
              key={photo.id}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
                isSelected ? 'ring-4 ring-blue-500 ring-opacity-75' : ''
              } ${isUpdating ? 'opacity-75' : ''}`}
            >
              {/* Selection checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onTogglePhoto(photo.id)}
                  disabled={isUpdating || isUnlocked}
                  className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                />
              </div>

              {/* Photo number */}
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded">
                  #{index + 1}
                </span>
              </div>

              {/* Photo */}
              <div className="relative">
                <Image
                  src={isUnlocked ? photo.highres_url : photo.preview_url}
                  alt={`Race photo ${index + 1} for bib ${photo.bib_number}`}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover"
                />

                {/* Watermark for locked photos */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-lg font-bold rotate-12 select-none">
                      PREVIEW
                    </div>
                  </div>
                )}

                {/* Unlocked indicator */}
                {isUnlocked && (
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-green-500 text-white text-sm px-2 py-1 rounded flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Unlocked
                    </span>
                  </div>
                )}
              </div>

              {/* Photo info */}
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Photo {index + 1}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(photo.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  {isSelected && !isUnlocked && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {formatPrice(pricePerPhoto)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No photos selected message */}
      {noneSelected && photos.length > 0 && (
        <div className="text-center py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-yellow-800 font-medium mb-2">No photos selected</p>
            <p className="text-yellow-700 text-sm">
              Select at least one photo to continue with your purchase.
            </p>
          </div>
        </div>
      )}

      {/* Download section for unlocked photos */}
      {anyUnlocked && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Ready to Download
          </h3>
          <p className="text-green-700 mb-4">
            Your purchased photos are ready for download. Click on individual photos above or use the buttons below.
          </p>
          <div className="flex gap-4">
            {photos.filter(photo => photo.access?.is_unlocked).map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => {
                  window.open(`/api/download/${photo.bib_number}?photo_id=${photo.id}`, '_blank');
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Download Photo #{index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}