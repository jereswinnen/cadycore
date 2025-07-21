'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import Image from 'next/image';

interface UploadedPhoto {
  id: string;
  filename: string;
  preview_url: string;
}

interface UploadResult {
  bib_number: string;
  uploaded_count: number;
  photos: UploadedPhoto[];
}

export default function PhotoUpload() {
  const searchParams = useSearchParams();
  const [bibNumber, setBibNumber] = useState(searchParams?.get('bib') || '');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!bibNumber.trim()) {
      setError('Please enter a bib number first');
      return;
    }

    if (acceptedFiles.length === 0) {
      setError('No valid image files selected');
      return;
    }

    setUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('bib_number', bibNumber.trim().toUpperCase());
      
      acceptedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/admin/photos/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResult(data.data);
      // Keep bib number so user can upload more photos to same bib
      
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [bibNumber]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    disabled: uploading || !bibNumber.trim()
  });

  const clearResults = () => {
    setUploadResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upload Photos</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Add photos for a specific bib number
                </p>
              </div>
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bib Number Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label htmlFor="bib_number" className="block text-sm font-medium text-gray-700 mb-2">
            Bib Number
          </label>
          <div className="flex space-x-4">
            <input
              type="text"
              id="bib_number"
              value={bibNumber}
              onChange={(e) => setBibNumber(e.target.value.toUpperCase())}
              placeholder="Enter bib number (e.g., 1234)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={uploading}
            />
            {uploadResult && (
              <button
                onClick={clearResults}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Clear & Upload More
              </button>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Photos
          </h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : bibNumber.trim()
                ? 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">
                  Uploading {acceptedFiles.length} photo{acceptedFiles.length !== 1 ? 's' : ''}...
                </p>
              </div>
            ) : !bibNumber.trim() ? (
              <div className="space-y-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-gray-500">
                  <p className="font-medium">Enter a bib number above to enable photo upload</p>
                  <p className="text-sm">JPEG, PNG, GIF, WebP files are supported</p>
                </div>
              </div>
            ) : isDragActive ? (
              <div className="space-y-4">
                <svg
                  className="mx-auto h-12 w-12 text-blue-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-blue-600 font-medium">Drop photos here to upload for bib {bibNumber}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-gray-600">
                  <p className="font-medium">
                    Drag and drop photos here for bib {bibNumber}
                  </p>
                  <p className="text-sm">or click to browse files</p>
                  <p className="text-xs mt-2 text-gray-500">
                    JPEG, PNG, GIF, WebP • Multiple files supported
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Results */}
        {uploadResult && (
          <div className="bg-green-100 border border-green-400 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-medium text-green-800">
                Successfully uploaded {uploadResult.uploaded_count} photo{uploadResult.uploaded_count !== 1 ? 's' : ''} for bib {uploadResult.bib_number}
              </h3>
            </div>
            
            {/* Photo Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              {uploadResult.photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="w-full h-24 bg-gray-100 rounded-lg shadow-sm overflow-hidden relative">
                    <Image
                      src={photo.preview_url}
                      alt={photo.filename}
                      fill
                      className="object-cover"
                      onLoad={() => console.log('Image loaded successfully:', photo.filename)}
                      onError={() => {
                        console.error('Image load error for:', photo.filename, 'URL:', photo.preview_url);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Link
                href={"/photo/" + uploadResult.bib_number}
                target="_blank"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Customer Page
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}