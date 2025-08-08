"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  SurveyFormData,
  SurveyFormInput,
  PhotoPreference,
  SocialMediaPreference,
  WillPose,
  PricePreference,
  BuyImmediately,
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
  photo_preference: z.string().min(1, "Photo preference is required"),
  social_media_preference: z.string().min(1, "Social media preference is required"),
  will_pose: z.string().min(1, "This field is required"),
  price_preference: z.string().min(1, "Price preference is required"),
  buy_immediately: z.string().min(1, "This field is required"),
});

interface SurveyFormProps {
  onSubmit: (data: SurveyFormData) => void;
  loading?: boolean;
  error?: string;
}

const photoPreferences: { value: PhotoPreference; label: string }[] = [
  { value: "posed", label: "Posed" },
  { value: "action", label: "Action" },
  { value: "both", label: "Both" },
];

const socialMediaPreferences: { value: SocialMediaPreference; label: string }[] = [
  { value: "posed", label: "Posed" },
  { value: "action", label: "Action" },
  { value: "both", label: "Both" },
  { value: "neither", label: "Neither" },
];

const willPoseOptions: { value: WillPose; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
];

const pricePreferences: { value: PricePreference; label: string }[] = [
  { value: "5-9", label: "$5-9" },
  { value: "10-14", label: "$10-14" },
  { value: "15-19", label: "$15-19" },
  { value: "20-24", label: "$20-24" },
  { value: "25+", label: "$25+" },
];

const buyImmediatelyOptions: { value: BuyImmediately; label: string }[] = [
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
    watchedFields.photo_preference &&
    watchedFields.social_media_preference &&
    watchedFields.will_pose &&
    watchedFields.price_preference &&
    watchedFields.buy_immediately;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card p-8">
        <form
          onSubmit={handleSubmit((data) => {
            const formData: SurveyFormData = {
              ...data,
              photo_preference: data.photo_preference as PhotoPreference,
              social_media_preference: data.social_media_preference as SocialMediaPreference,
              will_pose: data.will_pose as WillPose,
              price_preference: data.price_preference as PricePreference,
              buy_immediately: data.buy_immediately as BuyImmediately,
            };
            onSubmit(formData);
          })}
          className="space-y-6"
        >
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
            {errors.runner_email && (
              <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                {errors.runner_email.message}
              </p>
            )}
          </div>

          {/* Photo Preference */}
          <div>
            <label
              htmlFor="photo_preference"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Posed or action, what's your favorite? *
            </label>
            <select
              id="photo_preference"
              {...register("photo_preference")}
              className="input"
              disabled={loading}
            >
              <option value="">Select preference</option>
              {photoPreferences.map((pref) => (
                <option key={pref.value} value={pref.value}>
                  {pref.label}
                </option>
              ))}
            </select>
            {errors.photo_preference && (
              <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                {errors.photo_preference.message}
              </p>
            )}
          </div>

          {/* Social Media Preference */}
          <div>
            <label
              htmlFor="social_media_preference"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Which would you share on social media? *
            </label>
            <select
              id="social_media_preference"
              {...register("social_media_preference")}
              className="input"
              disabled={loading}
            >
              <option value="">Select preference</option>
              {socialMediaPreferences.map((pref) => (
                <option key={pref.value} value={pref.value}>
                  {pref.label}
                </option>
              ))}
            </select>
            {errors.social_media_preference && (
              <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                {errors.social_media_preference.message}
              </p>
            )}
          </div>

          {/* Will Pose */}
          <div>
            <label
              htmlFor="will_pose"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Will you stop 30 seconds to pose? *
            </label>
            <select
              id="will_pose"
              {...register("will_pose")}
              className="input"
              disabled={loading}
            >
              <option value="">Select answer</option>
              {willPoseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.will_pose && (
              <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                {errors.will_pose.message}
              </p>
            )}
          </div>

          {/* Price Preference */}
          <div>
            <label
              htmlFor="price_preference"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              What price feels fair for one photo? *
            </label>
            <select
              id="price_preference"
              {...register("price_preference")}
              className="input"
              disabled={loading}
            >
              <option value="">Select price range</option>
              {pricePreferences.map((pref) => (
                <option key={pref.value} value={pref.value}>
                  {pref.label}
                </option>
              ))}
            </select>
            {errors.price_preference && (
              <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                {errors.price_preference.message}
              </p>
            )}
          </div>

          {/* Buy Immediately */}
          <div>
            <label
              htmlFor="buy_immediately"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Would you buy if ready immediately? *
            </label>
            <select
              id="buy_immediately"
              {...register("buy_immediately")}
              className="input"
              disabled={loading}
            >
              <option value="">Select answer</option>
              {buyImmediatelyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.buy_immediately && (
              <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                {errors.buy_immediately.message}
              </p>
            )}
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
