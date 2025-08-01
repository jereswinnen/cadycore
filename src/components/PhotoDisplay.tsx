'use client';

import Image from 'next/image';
import { PhotoWithAccess } from '@/types';
import { useImageWithFallback } from '@/hooks/useImageWithFallback';

interface PhotoDisplayProps {
  photo: PhotoWithAccess;
  index: number;
  isUnlocked?: boolean;
  showNumber?: boolean;
}

export default function PhotoDisplay({
  photo,
  index,
  isUnlocked = false,
  showNumber = true,
}: PhotoDisplayProps) {
  const imageUrl = isUnlocked ? photo.highres_url : photo.preview_url;
  const { currentUrl, hasError, handleImageError } = useImageWithFallback({
    photoId: photo.id,
    initialUrl: imageUrl,
  });

  return (
    <div className="card overflow-hidden">
      {/* Photo number */}
      {showNumber && (
        <div className="absolute top-4 right-4 z-10">
          <div className="px-3 py-1 rounded-full text-white text-sm font-medium" 
               style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)' }}>
            #{index + 1}
          </div>
        </div>
      )}

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
    </div>
  );
}