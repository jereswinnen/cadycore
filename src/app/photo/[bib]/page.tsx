'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import PhotoGallery from '@/components/PhotoGallery';
import { PhotosWithSelections } from '@/types';
import { usePhotoSelection } from '@/hooks/usePhotoSelection';

interface PhotoPageProps {
  params: Promise<{
    bib: string;
  }>;
}

export default function PhotoPage({ params }: PhotoPageProps) {
  const [photosData, setPhotosData] = useState<PhotosWithSelections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { bib } = use(params);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(`/api/photos/${bib}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load photos');
        }

        if (data.success && data.data) {
          setPhotosData(data.data);
        } else {
          setError('No photos found');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [bib]);

  const photoSelection = usePhotoSelection({
    bib,
    photos: photosData?.photos || [],
    initialSelections: photosData?.selections || [],
  });

  const handleUnlock = () => {
    // Navigate to unlock flow (survey + payment) with selected photos
    router.push(`/photo/${bib}/unlock`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your photos...</p>
        </div>
      </div>
    );
  }

  if (error || !photosData || !photosData.photos.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              No Photos Found
            </h2>
            <p className="text-red-600 mb-4">
              {error || 'We couldn\'t find any photos for this bib number.'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Another Bib Number
            </button>
          </div>
        </div>
      </div>
    );
  }

  const anyUnlocked = photosData.photos.some(photo => photo.access?.is_unlocked);
  const showUnlockButton = !anyUnlocked;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Search
            </button>
            <div className="text-sm text-gray-500">
              Bib #{bib}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Race Photos
          </h1>
          <p className="text-gray-600">
            {anyUnlocked 
              ? 'Your photos have been unlocked! You can now download the high-resolution versions.'
              : 'Select the photos you want and complete a quick survey and payment to unlock them.'
            }
          </p>
        </div>

        {/* Photo Gallery */}
        <PhotoGallery
          photos={photosData.photos}
          selectedPhotoIds={photoSelection.selectedPhotoIds}
          onTogglePhoto={photoSelection.togglePhoto}
          onSelectAll={photoSelection.selectAll}
          onDeselectAll={photoSelection.deselectAll}
          totalSelected={photoSelection.totalSelected}
          pricePerPhoto={photoSelection.pricePerPhoto}
          totalPrice={photoSelection.totalPrice}
          savings={photoSelection.savings}
          allSelected={photoSelection.allSelected}
          noneSelected={photoSelection.noneSelected}
          isUpdating={photoSelection.isUpdating}
          onUnlock={handleUnlock}
          showUnlockButton={showUnlockButton}
        />
      </div>
    </div>
  );
}