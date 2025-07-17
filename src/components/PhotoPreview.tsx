'use client';

import Image from 'next/image';
import { Photo } from '@/types';

interface PhotoPreviewProps {
  photo: Photo;
  showWatermark?: boolean;
  onUnlock?: () => void;
  isUnlocked?: boolean;
}

export default function PhotoPreview({ 
  photo, 
  showWatermark = true, 
  onUnlock,
  isUnlocked = false 
}: PhotoPreviewProps) {
  const imageUrl = isUnlocked ? photo.highres_url : photo.preview_url;
  const altText = `Race photo for bib number ${photo.bib_number}`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={altText}
          width={800}
          height={600}
          className="w-full h-auto object-cover"
          priority
        />
        
        {showWatermark && !isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg text-xl font-bold rotate-12 select-none">
              PREVIEW
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Bib Number: <span className="font-medium">{photo.bib_number}</span>
        </p>
        
        {!isUnlocked && onUnlock && (
          <button
            onClick={onUnlock}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Get Full Photo - $10
          </button>
        )}
        
        {isUnlocked && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ Photo unlocked! You can now download the high-resolution version.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}