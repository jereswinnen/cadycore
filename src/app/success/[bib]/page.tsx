'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Photo, PhotoAccess } from '@/types';

interface SuccessPageProps {
  params: {
    bib: string;
  };
  searchParams: {
    session_id?: string;
  };
}

export default function SuccessPage({ params, searchParams }: SuccessPageProps) {
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

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/download/${params.bib}`);
      
      if (!response.ok) {
        throw new Error('Failed to download photo');
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and click it to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `race-photo-${params.bib}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to download photo. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
              Error
            </h2>
            <p className="text-red-600 mb-4">
              {error || 'Something went wrong.'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              Payment Successful!
            </h1>
            <p className="text-green-700 mb-6">
              Thank you for your purchase. Your photo has been unlocked and is ready for download.
            </p>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors mr-4"
            >
              Download High-Resolution Photo
            </button>
            
            <button
              onClick={() => router.push(`/photo/${params.bib}`)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              View Photo Details
            </button>
          </div>

          {/* Photo Details */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Photo Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Bib Number</h3>
                <p className="text-gray-900">{photo.bib_number}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Purchase Date</h3>
                <p className="text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Status</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Unlocked
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Downloads</h3>
                <p className="text-gray-900">{access?.download_count || 0}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Important Information
            </h2>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Your photo download link will remain active</li>
              <li>• You can download your photo multiple times</li>
              <li>• The high-resolution image is perfect for printing</li>
              <li>• Keep this page bookmarked for future reference</li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Search for Another Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}