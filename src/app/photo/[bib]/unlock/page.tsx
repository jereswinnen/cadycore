'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import SurveyForm from '@/components/SurveyForm';
import { Photo, PhotoAccess, SurveyFormData } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface UnlockPageProps {
  params: Promise<{
    bib: string;
  }>;
}

export default function UnlockPage({ params }: UnlockPageProps) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [access, setAccess] = useState<PhotoAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [surveyError, setSurveyError] = useState('');
  const router = useRouter();
  const { bib } = use(params);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`/api/photos/${bib}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load photo');
        }

        if (data.success && data.data) {
          setPhoto(data.data);
          setAccess(data.data.access || null);
          
          // If already unlocked, redirect to photo page
          if (data.data.access?.is_unlocked) {
            router.push(`/photo/${bib}`);
            return;
          }
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
  }, [bib, router]);

  const handleSurveySubmit = async (data: SurveyFormData) => {
    setSurveyLoading(true);
    setSurveyError('');

    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          bib_number: bib,
          photo_id: photo?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit survey');
      }

      // Survey submitted successfully, now proceed to payment
      await handlePayment();
    } catch (err: any) {
      setSurveyError(err.message || 'Failed to submit survey');
    } finally {
      setSurveyLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bib_number: bib,
          photo_id: photo?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment session');
      }

      // Redirect to Stripe Checkout
      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setPaymentLoading(false);
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

  const isLoading = surveyLoading || paymentLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push(`/photo/${bib}`)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Photo
            </button>
            <div className="text-sm text-gray-500">
              Bib #{bib}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Unlock Your Photo
          </h1>
          <p className="text-gray-600">
            Complete a quick survey and payment to unlock your high-resolution photo for {formatCurrency(1000)}.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Survey</span>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-1 bg-gray-200 rounded-full">
                  <div className="h-1 bg-blue-600 rounded-full w-0"></div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-1 bg-gray-200 rounded-full">
                  <div className="h-1 bg-gray-200 rounded-full w-0"></div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Download</span>
              </div>
            </div>
          </div>
        </div>

        {/* Survey Form */}
        <div className="max-w-4xl mx-auto">
          <SurveyForm
            onSubmit={handleSurveySubmit}
            loading={isLoading}
            error={surveyError}
          />
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {paymentLoading ? 'Processing Payment...' : 'Submitting Survey...'}
              </h3>
              <p className="text-gray-600 text-sm">
                {paymentLoading 
                  ? 'Please wait while we redirect you to payment.'
                  : 'Please wait while we process your survey.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}