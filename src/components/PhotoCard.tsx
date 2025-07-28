'use client';

import Image from 'next/image';
import { PhotoWithAccess } from '@/types';
import { formatPrice } from '@/lib/pricing';
import { useImageWithFallback } from '@/hooks/useImageWithFallback';

interface PhotoCardProps {
  photo: PhotoWithAccess;
  index: number;
  isSelected: boolean;
  isUnlocked: boolean;
  isUpdating: boolean;
  pricePerPhoto: number;
  onTogglePhoto: (photoId: string) => void;
}

export default function PhotoCard({
  photo,
  index,
  isSelected,
  isUnlocked,
  isUpdating,
  pricePerPhoto,
  onTogglePhoto,
}: PhotoCardProps) {
  const imageUrl = isUnlocked ? photo.highres_url : photo.preview_url;
  const { currentUrl, hasError, handleImageError } = useImageWithFallback({
    photoId: photo.id,
    initialUrl: imageUrl,
  });

  return (
    <div
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
        {hasError ? (
          <div className="w-full h-72 flex items-center justify-center" style={{ background: 'var(--secondary)' }}>
            <div className="text-center">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Image unavailable</span>
            </div>
          </div>
        ) : (
          <Image
            src={currentUrl}
            alt={`Race photo ${index + 1} for bib ${photo.bib_number}`}
            width={400}
            height={300}
            className="w-full h-72 object-cover"
            onError={handleImageError}
          />
        )}

        {/* Watermark for locked photos */}
        {!isUnlocked && !hasError && (
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
                 style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)' }}>
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
}