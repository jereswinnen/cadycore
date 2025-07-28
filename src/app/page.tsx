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
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header */}
            <div className="mb-16">
              <h1 className="text-5xl sm:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Get Your Race Photo
              </h1>
              <p className="text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Enter your bib number to find and purchase your professional race photo. 
                High-resolution downloads available for just $10.
              </p>
            </div>

            {/* Bib Input - Enhanced */}
            <div className="mb-20">
              <BibInput 
                onSubmit={handleBibSubmit} 
                loading={loading} 
                error={error} 
              />
            </div>

            {/* How it works - Apple Card Style */}
            <div className="card p-12 mb-16">
              <h2 className="text-3xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110" 
                       style={{ background: 'var(--primary)', boxShadow: '0 8px 30px rgba(10, 78, 58, 0.3)' }}>
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
                    Enter Bib Number
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Type in your race bib number to find your photo
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110" 
                       style={{ background: 'var(--primary)', boxShadow: '0 8px 30px rgba(10, 78, 58, 0.3)' }}>
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
                    Complete Survey
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Fill out a quick survey about your race experience
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110" 
                       style={{ background: 'var(--primary)', boxShadow: '0 8px 30px rgba(10, 78, 58, 0.3)' }}>
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
                    Purchase & Download
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Pay $10 and download your high-resolution photo
                  </p>
                </div>
              </div>
            </div>

            {/* Features - Clean Card Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card p-8 text-left">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" 
                     style={{ background: 'var(--secondary)', border: '2px solid var(--border)' }}>
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-semibold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
                  Professional Quality
                </h3>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  High-resolution photos captured by professional race photographers
                </p>
              </div>
              <div className="card p-8 text-left">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" 
                     style={{ background: 'var(--secondary)', border: '2px solid var(--border)' }}>
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
                  Instant Download
                </h3>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Download your photo immediately after purchase - no waiting
                </p>
              </div>
              <div className="card p-8 text-left md:col-span-2 lg:col-span-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" 
                     style={{ background: 'var(--secondary)', border: '2px solid var(--border)' }}>
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
                  Affordable Pricing
                </h3>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Just $10 per photo with bulk discounts available for multiple selections
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
