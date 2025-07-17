'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BibInput from '@/components/BibInput';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleBibSubmit = async (bib: string) => {
    setLoading(true);
    setError('');

    try {
      // Check if photo exists for this bib number
      const response = await fetch(`/api/photos/${bib}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find photo');
      }

      if (data.success && data.data) {
        // Photo found, navigate to photo preview page
        router.push(`/photo/${bib}`);
      } else {
        setError('No photo found for this bib number. Please check your number and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Get Your Race Photo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter your bib number to find and purchase your professional race photo. 
              High-resolution downloads available for just $10.
            </p>
          </div>

          {/* Bib Input */}
          <div className="mb-12">
            <BibInput 
              onSubmit={handleBibSubmit} 
              loading={loading} 
              error={error} 
            />
          </div>

          {/* How it works */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Enter Bib Number</h3>
                <p className="text-gray-600 text-sm">
                  Type in your race bib number to find your photo
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Complete Survey</h3>
                <p className="text-gray-600 text-sm">
                  Fill out a quick survey about your race experience
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Purchase & Download</h3>
                <p className="text-gray-600 text-sm">
                  Pay $10 and download your high-resolution photo
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                🏆 Professional Quality
              </h3>
              <p className="text-gray-600 text-sm">
                High-resolution photos captured by professional race photographers
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                ⚡ Instant Download
              </h3>
              <p className="text-gray-600 text-sm">
                Download your photo immediately after purchase - no waiting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
