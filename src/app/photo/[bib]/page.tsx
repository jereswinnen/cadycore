'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhotoPreview from '@/components/PhotoPreview';
import { Photo, PhotoAccess } from '@/types';

interface PhotoPageProps {
  params: {
    bib: string;
  };
}

export default function PhotoPage({ params }: PhotoPageProps) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [access, setAccess] = useState<PhotoAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`/api/photos/${params.bib}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load photo');
        }

        if (data.success && data.data) {
          setPhoto(data.data);
          setAccess(data.data.access || null);
        } else {
          setError('Photo not found');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [params.bib]);

  const handleUnlock = () => {
    // Navigate to unlock flow (survey + payment)
    router.push(`/photo/${params.bib}/unlock`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your photo...</p>
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Photo Not Found
            </h2>
            <p className="text-red-600 mb-4">
              {error || 'We couldn\'t find a photo for this bib number.'}
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

  const isUnlocked = access?.is_unlocked || false;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Search
            </button>
            <div className="text-sm text-gray-500">
              Bib #{params.bib}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Race Photo
          </h1>
          <p className="text-gray-600">
            {isUnlocked 
              ? 'Your photo has been unlocked! You can now download the high-resolution version.'
              : 'Complete a quick survey and payment to unlock your high-resolution photo.'
            }
          </p>
        </div>

        {/* Photo Preview */}
        <div className="max-w-4xl mx-auto mb-8">
          <PhotoPreview 
            photo={photo}
            showWatermark={true}
            onUnlock={!isUnlocked ? handleUnlock : undefined}
            isUnlocked={isUnlocked}
          />
        </div>

        {/* Photo Details */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Photo Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Bib Number</h3>
                <p className="text-gray-900">{photo.bib_number}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Photo Taken</h3>
                <p className="text-gray-900">
                  {new Date(photo.uploaded_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {access && (
                <>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Status</h3>
                    <p className="text-gray-900">
                      {access.is_unlocked ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Locked
                        </span>
                      )}
                    </p>
                  </div>
                  {access.download_count > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Downloads</h3>
                      <p className="text-gray-900">{access.download_count}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Download Section */}
        {isUnlocked && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Ready to Download
              </h2>
              <p className="text-green-700 mb-4">
                Your photo is ready for download. Click the button below to get your high-resolution image.
              </p>
              <button
                onClick={() => {
                  // Handle download
                  window.open(`/api/download/${params.bib}`, '_blank');
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Download High-Resolution Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}