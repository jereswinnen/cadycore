"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  SurveyFormData,
  SurveyFormInput,
  SocialMediaPreference,
  WaitingStopsBuying,
} from "@/types";
import { validateEmail } from "@/lib/utils";

const surveySchema = z.object({
  runner_name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  runner_email: z
    .string()
    .min(1, "Email is required")
    .refine(validateEmail, "Invalid email format"),
  social_media_preference: z
    .string()
    .min(1, "Social media preference is required"),
  waiting_stops_buying: z.string().min(1, "This field is required"),
});

interface SurveyFormProps {
  onSubmit: (data: SurveyFormData) => void;
  loading?: boolean;
  error?: string;
}

const socialMediaPreferences: {
  value: SocialMediaPreference;
  label: string;
}[] = [
  { value: "posed", label: "Posed" },
  { value: "action", label: "Action" },
];

const waitingStopsBuyingOptions: {
  value: WaitingStopsBuying;
  label: string;
}[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export default function SurveyForm({
  onSubmit,
  loading = false,
  error,
}: SurveyFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SurveyFormInput>({
    resolver: zodResolver(surveySchema),
  });

  const watchedFields = watch();
  const isFormValid =
    watchedFields.runner_name?.trim() &&
    watchedFields.runner_email?.trim() &&
    watchedFields.social_media_preference &&
    watchedFields.waiting_stops_buying;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card p-8">
        <form
          onSubmit={handleSubmit((data) => {
            const formData: SurveyFormData = {
              ...data,
              social_media_preference:
                data.social_media_preference as SocialMediaPreference,
              waiting_stops_buying:
                data.waiting_stops_buying as WaitingStopsBuying,
            };
            onSubmit(formData);
          })}
          className="space-y-6"
        >
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex">
              <span
                className="text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #bb4a92 0%, #3e6bdc 100%)",
                }}
              >
                Personal Details
              </span>
            </div>
            {/* Name */}
            <div>
              <label
                htmlFor="runner_name"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Full Name *
              </label>
              <input
                type="text"
                id="runner_name"
                {...register("runner_name")}
                className="input"
                disabled={loading}
              />
              {errors.runner_name && (
                <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                  {errors.runner_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="runner_email"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Email Address *
              </label>
              <input
                type="email"
                id="runner_email"
                {...register("runner_email")}
                className="input"
                disabled={loading}
              />
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                📸 Your high-resolution photos will be delivered to this email
                address after purchase.
              </p>
              {errors.runner_email && (
                <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                  {errors.runner_email.message}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-8">
            <div
              className="w-full border-t-2"
              style={{ borderColor: "var(--border)" }}
            />
          </div>

          {/* Survey Questions Section */}
          <div className="space-y-6">
            <div className="flex">
              <span
                className="text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #bb4a92 0%, #3e6bdc 100%)",
                }}
              >
                Quick Survey
              </span>
            </div>
            {/* Social Media Preference */}
            <div>
              <label
                className="block text-sm font-medium mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Which would you rather share on social media? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialMediaPreferences.map((pref) => (
                  <label
                    key={pref.value}
                    className="flex flex-col items-center p-6 border rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                    style={{
                      borderColor:
                        watchedFields.social_media_preference === pref.value
                          ? "var(--primary)"
                          : "var(--border)",
                      backgroundColor:
                        watchedFields.social_media_preference === pref.value
                          ? "rgba(187, 74, 146, 0.05)"
                          : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      value={pref.value}
                      {...register("social_media_preference")}
                      disabled={loading}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center space-y-4 w-full">
                      <Image
                        src={`/surveyPreview${pref.value === "posed" ? "Posed" : "Action"}.jpg`}
                        alt={`${pref.label} photo example`}
                        width={160}
                        height={120}
                        className="w-40 h-30 object-cover rounded-lg"
                      />
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                          style={{
                            borderColor:
                              watchedFields.social_media_preference ===
                              pref.value
                                ? "var(--primary)"
                                : "var(--border)",
                            backgroundColor:
                              watchedFields.social_media_preference ===
                              pref.value
                                ? "var(--primary)"
                                : "transparent",
                          }}
                        >
                          {watchedFields.social_media_preference ===
                            pref.value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className="text-lg font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {pref.label}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.social_media_preference && (
                <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                  {errors.social_media_preference.message}
                </p>
              )}
            </div>

            {/* Waiting Stops Buying */}
            <div>
              <label
                className="block text-sm font-medium mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Does waiting for race photos stop you from buying? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {waitingStopsBuyingOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center justify-center p-6 border rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                    style={{
                      borderColor:
                        watchedFields.waiting_stops_buying === option.value
                          ? "var(--primary)"
                          : "var(--border)",
                      backgroundColor:
                        watchedFields.waiting_stops_buying === option.value
                          ? "rgba(187, 74, 146, 0.05)"
                          : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("waiting_stops_buying")}
                      disabled={loading}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor:
                            watchedFields.waiting_stops_buying === option.value
                              ? "var(--primary)"
                              : "var(--border)",
                          backgroundColor:
                            watchedFields.waiting_stops_buying === option.value
                              ? "var(--primary)"
                              : "transparent",
                        }}
                      >
                        {watchedFields.waiting_stops_buying ===
                          option.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className="text-lg font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {option.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.waiting_stops_buying && (
                <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                  {errors.waiting_stops_buying.message}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255, 69, 58, 0.1)",
                border: "1px solid var(--danger)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--danger)" }}>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="btn btn-primary w-full text-lg font-semibold"
            style={{
              padding: "1rem 2rem",
              opacity: !isFormValid && !loading ? "0.5" : "1",
              cursor: !isFormValid && !loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Submitting..." : "Continue to Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
