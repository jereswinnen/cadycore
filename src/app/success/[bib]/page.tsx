"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PhotoWithAccess } from "@/types";
import PhotoDisplay from "@/components/PhotoDisplay";

interface SuccessPageProps {
  params: Promise<{
    bib: string;
  }>;
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default function SuccessPage({ params }: SuccessPageProps) {
  const [photos, setPhotos] = useState<PhotoWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingPhotoId, setDownloadingPhotoId] = useState<string | null>(
    null
  );
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    sent: boolean;
    sending: boolean;
    error?: string;
    sentAt?: string;
  }>({ sent: false, sending: false });
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const router = useRouter();
  const { bib } = use(params);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(`/api/photos/${bib}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load photos");
        }

        if (data.success && data.data) {
          // Only show unlocked photos
          const unlockedPhotos = data.data.photos.filter(
            (photo: PhotoWithAccess) => photo.access?.is_unlocked
          );
          setPhotos(unlockedPhotos);

          if (unlockedPhotos.length === 0) {
            setError("No unlocked photos found");
          }

          // Check email status if payment data is available
          if (data.data.payment) {
            setPaymentId(data.data.payment.id);
            setEmailStatus({
              sent: data.data.payment.email_sent || false,
              sending: false,
              sentAt: data.data.payment.email_sent_at,
            });
          }
        } else {
          setError("Photos not found");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [bib]);

  const handleEmailPhotos = async () => {
    if (!paymentId) {
      alert('Payment information not available');
      return;
    }

    setEmailStatus(prev => ({ ...prev, sending: true, error: undefined }));

    try {
      const response = await fetch('/api/email/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          force_resend: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailStatus({
          sent: true,
          sending: false,
          sentAt: new Date().toISOString(),
        });
        alert('Photos emailed successfully! Check your inbox.');
      } else {
        setEmailStatus(prev => ({
          ...prev,
          sending: false,
          error: data.error || 'Failed to send email',
        }));
        alert(`Failed to send email: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Email error:', error);
      setEmailStatus(prev => ({
        ...prev,
        sending: false,
        error: 'Network error occurred',
      }));
      alert('Failed to send email. Please try again.');
    }
  };

  const handleDownload = async (photoId: string) => {
    setDownloadingPhotoId(photoId);
    try {
      const response = await fetch(`/api/download/${bib}?photo_id=${photoId}`);

      if (!response.ok) {
        throw new Error("Failed to download photo");
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and click it to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `race-photo-${bib}-${photoId.slice(-8)}.jpg`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Refresh photos data to update download counters
      await refreshPhotosData();
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download photo. Please try again.");
    } finally {
      setDownloadingPhotoId(null);
    }
  };

  const refreshPhotosData = async () => {
    try {
      const response = await fetch(`/api/photos/${bib}`);
      const data = await response.json();

      if (data.success && data.data) {
        const unlockedPhotos = data.data.photos.filter(
          (photo: PhotoWithAccess) => photo.access?.is_unlocked
        );
        setPhotos(unlockedPhotos);
      }
    } catch (error) {
      console.error("Error refreshing photos data:", error);
    }
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    try {
      const response = await fetch(`/api/download/${bib}/zip`);

      if (!response.ok) {
        throw new Error("Failed to download photos");
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and click it to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `race-photos-${bib}.zip`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Refresh photos data to update download counters
      await refreshPhotosData();
    } catch (error) {
      console.error("Download all error:", error);
      alert("Failed to download photos. Please try again.");
    } finally {
      setDownloadingAll(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-6">
            <div
              className="w-full h-full border-3 rounded-full animate-spin"
              style={{
                borderColor: "var(--border)",
                borderTopColor: "var(--primary)",
                borderWidth: "3px",
              }}
            ></div>
          </div>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error || photos.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="max-w-md mx-auto text-center">
          <div className="card p-8" style={{ borderColor: "var(--danger)" }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255, 69, 58, 0.1)" }}
            >
              <span className="text-2xl">❌</span>
            </div>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Error
            </h2>
            <p
              className="text-base mb-6 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {error || "No unlocked photos found."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="btn btn-primary"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <Image
              src="/logo.png"
              alt="Logo"
              width={160}
              height={53}
              className="h-14 w-auto"
              priority
            />
          </div>
          {/* Success Message */}
          <div
            className="flex justify-between items-center card p-8 mb-8 text-center"
            style={{
              borderColor: "var(--success)",
              background: "rgba(48, 209, 88, 0.05)",
            }}
          >
            <div className="flex items-center justify-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "var(--success)" }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h1
                  className="text-2xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Payment Successful!
                </h1>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {photos.length} photo{photos.length !== 1 ? "s" : ""} unlocked
                  • Bib #{bib}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {photos.length > 1 && (
                <button
                  onClick={handleDownloadAll}
                  disabled={downloadingAll}
                  className="btn btn-primary font-semibold flex items-center justify-center"
                  style={{
                    padding: "0.75rem 1.5rem",
                    opacity: downloadingAll ? "0.7" : "1",
                  }}
                >
                  {downloadingAll ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Zip...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download All ({photos.length})
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleEmailPhotos}
                disabled={emailStatus.sending}
                className="btn font-semibold flex items-center justify-center"
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: emailStatus.sent ? "var(--success)" : "var(--secondary)",
                  color: emailStatus.sent ? "white" : "var(--text-primary)",
                  opacity: emailStatus.sending ? "0.7" : "1",
                }}
              >
                {emailStatus.sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending Email...
                  </>
                ) : emailStatus.sent ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Email Sent ✓
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Photos
                  </>
                )}
              </button>

{/* <button
                onClick={() => router.push(`/photo/${bib}`)}
                className="btn btn-secondary font-semibold"
                style={{ padding: "0.75rem 1.5rem" }}
              >
                View All Photos
              </button> */}
            </div>
          </div>

          {/* Photos Grid */}
          <div className="card p-8 mb-12">
            <h2
              className="text-2xl font-semibold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Your Photos ({photos.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {photos.map((photo, index) => (
                <div key={photo.id} className="space-y-4">
                  <PhotoDisplay
                    photo={photo}
                    index={index}
                    isUnlocked={true}
                    showNumber={false}
                  />
                  {/* Download button underneath */}
                  <button
                    onClick={() => handleDownload(photo.id)}
                    disabled={downloadingPhotoId === photo.id}
                    className="btn w-full font-semibold"
                    style={{
                      background: "var(--success)",
                      color: "white",
                      opacity: downloadingPhotoId === photo.id ? "0.7" : "1",
                    }}
                  >
                    {downloadingPhotoId === photo.id
                      ? "Downloading..."
                      : "Download High-Res"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Summary */}
          <div className="card p-8 mb-12">
            <h2
              className="text-2xl font-semibold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Purchase Summary
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3
                  className="font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Bib Number
                </h3>
                <p className="text-lg" style={{ color: "var(--text-primary)" }}>
                  {bib}
                </p>
              </div>
              <div>
                <h3
                  className="font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Purchase Date
                </h3>
                <p className="text-lg" style={{ color: "var(--text-primary)" }}>
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <h3
                  className="font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Photos Purchased
                </h3>
                <p className="text-lg" style={{ color: "var(--text-primary)" }}>
                  {photos.length}
                </p>
              </div>
              <div>
                <h3
                  className="font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Total Downloads
                </h3>
                <p className="text-lg" style={{ color: "var(--text-primary)" }}>
                  {photos.reduce(
                    (total, photo) =>
                      total + (photo.access?.download_count || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "var(--secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Important Information
            </h2>
            <ul
              className="space-y-3"
              style={{ color: "var(--text-secondary)" }}
            >
              <li className="flex items-start">
                <span
                  className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                  style={{ background: "var(--primary)" }}
                ></span>
                Your photo download links will remain active
              </li>
              <li className="flex items-start">
                <span
                  className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                  style={{ background: "var(--primary)" }}
                ></span>
                You can download your photos multiple times
              </li>
              <li className="flex items-start">
                <span
                  className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                  style={{ background: "var(--primary)" }}
                ></span>
                The high-resolution images are perfect for printing
              </li>
              <li className="flex items-start">
                <span
                  className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                  style={{ background: "var(--primary)" }}
                ></span>
                {emailStatus.sent 
                  ? `Photos were emailed to you${emailStatus.sentAt ? ` on ${new Date(emailStatus.sentAt).toLocaleDateString()}` : ''}`
                  : 'Use the "Email Photos" button to receive photos via email'
                }
              </li>
              <li className="flex items-start">
                <span
                  className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                  style={{ background: "var(--primary)" }}
                ></span>
                Keep this page bookmarked for future reference
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="mt-12 text-center">
            <button
              onClick={() => router.push("/")}
              className="font-medium transition-colors"
              style={{ color: "var(--primary)" }}
            >
              ← Search for Another Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
