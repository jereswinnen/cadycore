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
      <div className="card p-8 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Your Race Photos ({photos.length} photo{photos.length !== 1 ? 's' : ''})
            </h2>
            <div className="flex gap-4">
              <button
                onClick={allSelected ? onDeselectAll : onSelectAll}
                disabled={isUpdating}
                className="btn btn-secondary"
                style={{ 
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  opacity: isUpdating ? '0.5' : '1'
                }}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
              {!allSelected && !noneSelected && (
                <button
                  onClick={onDeselectAll}
                  disabled={isUpdating}
                  className="font-medium"
                  style={{ 
                    color: 'var(--text-secondary)',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    opacity: isUpdating ? '0.5' : '1'
                  }}
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          {totalSelected > 0 && (
            <div className="rounded-2xl p-6 min-w-72" 
                 style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
              <div className="text-right">
                <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {totalSelected} photo{totalSelected !== 1 ? 's' : ''} selected
                </div>
                <div className="text-lg font-semibold mb-1" style={{ color: 'var(--primary)' }}>
                  {formatPrice(pricePerPhoto)} each
                </div>
                <div className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Total: {formatPrice(totalPrice)}
                </div>
                {savings.savings > 0 && (
                  <div className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                    Save {formatPrice(savings.savings)} ({savings.percentageSaved}% off)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Unlock button */}
        {showUnlockButton && totalSelected > 0 && onUnlock && (
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={onUnlock}
              disabled={isUpdating}
              className="btn btn-primary w-full sm:w-auto text-lg font-semibold"
              style={{
                padding: '1rem 2rem',
                opacity: isUpdating ? '0.5' : '1',
                cursor: isUpdating ? 'not-allowed' : 'pointer'
              }}
            >
              {isUpdating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                `Continue with ${totalSelected} photo${totalSelected !== 1 ? 's' : ''} - ${formatPrice(totalPrice)}`
              )}
            </button>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {photos.map((photo, index) => {
          const isSelected = selectedPhotoIds.includes(photo.id);
          const isUnlocked = photo.access?.is_unlocked || false;

          return (
            <div
              key={photo.id}
              className={`card overflow-hidden transition-all duration-300 cursor-pointer ${
                isUpdating ? 'opacity-75' : ''
              }`}
              style={{
                transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                borderWidth: isSelected ? '2px' : '1px',
                boxShadow: isSelected 
                  ? '0 20px 40px rgba(187, 74, 146, 0.2), 0 8px 16px rgba(187, 74, 146, 0.1)' 
                  : 'var(--shadow-sm)'
              }}
              onClick={() => !isUpdating && !isUnlocked && onTogglePhoto(photo.id)}
            >
              {/* Selection checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  isSelected 
                    ? 'bg-white border-white' 
                    : 'bg-black bg-opacity-20 border-white'
                }`}>
                  {isSelected && (
                    <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Photo number */}
              <div className="absolute top-4 right-4 z-10">
                <div className="px-3 py-1 rounded-full text-white text-sm font-medium" 
                     style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)' }}>
                  #{index + 1}
                </div>
              </div>

              {/* Photo */}
              <div className="relative">
                <Image
                  src={isUnlocked ? photo.highres_url : photo.preview_url}
                  alt={`Race photo ${index + 1} for bib ${photo.bib_number}`}
                  width={400}
                  height={300}
                  className="w-full h-72 object-cover"
                />

                {/* Watermark for locked photos */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="px-6 py-3 rounded-2xl text-white text-lg font-bold rotate-12 select-none"
                         style={{ 
                           background: 'rgba(0, 0, 0, 0.7)', 
                           backdropFilter: 'blur(10px)',
                           border: '2px solid rgba(255, 255, 255, 0.3)'
                         }}>
                      PREVIEW
                    </div>
                  </div>
                )}

                {/* Unlocked indicator */}
                {isUnlocked && (
                  <div className="absolute bottom-4 left-4">
                    <div className="px-3 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2" 
                         style={{ background: 'var(--success)', boxShadow: '0 4px 12px rgba(187, 74, 146, 0.4)' }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Unlocked
                    </div>
                  </div>
                )}
              </div>

              {/* Photo info */}
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                      Photo {index + 1}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(photo.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  {isSelected && !isUnlocked && (
                    <div className="text-right">
                      <p className="text-lg font-semibold" style={{ color: 'var(--primary)' }}>
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
        <div className="text-center py-12">
          <div className="card p-8 max-w-md mx-auto" style={{ borderColor: 'var(--warning)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" 
                 style={{ background: 'rgba(255, 159, 10, 0.1)' }}>
              <span className="text-3xl">📷</span>
            </div>
            <p className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              No photos selected
            </p>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
              Select at least one photo to continue with your purchase.
            </p>
          </div>
        </div>
      )}

      {/* Download section for unlocked photos */}
      {anyUnlocked && (
        <div className="mt-12">
          <div className="card p-8" style={{ borderColor: 'var(--success)', background: 'rgba(48, 209, 88, 0.05)' }}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" 
                   style={{ background: 'var(--success)' }}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Ready to Download
              </h3>
            </div>
            <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
              Your purchased photos are ready for download. Click on individual photos above or use the buttons below.
            </p>
            <div className="flex flex-wrap gap-4">
              {photos.filter(photo => photo.access?.is_unlocked).map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    window.open(`/api/download/${photo.bib_number}?photo_id=${photo.id}`, '_blank');
                  }}
                  className="btn"
                  style={{
                    background: 'var(--success)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    boxShadow: '0 4px 12px rgba(187, 74, 146, 0.3)'
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