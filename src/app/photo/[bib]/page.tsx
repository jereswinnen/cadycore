'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-6">
            <div className="w-full h-full border-3 rounded-full animate-spin" 
                 style={{ 
                   borderColor: 'var(--border)', 
                   borderTopColor: 'var(--primary)',
                   borderWidth: '3px'
                 }}></div>
          </div>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Loading your photos...
          </p>
        </div>
      </div>
    );
  }

  if (error || !photosData || !photosData.photos.length) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="max-w-md mx-auto text-center">
          <div className="card p-8" style={{ borderColor: 'var(--danger)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" 
                 style={{ background: 'rgba(255, 69, 58, 0.1)' }}>
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              No Photos Found
            </h2>
            <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {error || 'We couldn\'t find any photos for this bib number.'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn btn-primary"
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
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
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
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/')}
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              ← Back to Search
            </button>
            <div className="px-4 py-2 rounded-full" 
                 style={{ 
                   background: 'var(--secondary)', 
                   color: 'var(--text-secondary)',
                   fontSize: '0.875rem',
                   fontWeight: '500'
                 }}>
              Bib #{bib}
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Your Race Photos
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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