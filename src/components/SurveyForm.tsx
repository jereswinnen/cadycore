"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  SurveyFormData,
  SurveyFormInput,
  AgeGroup,
  RaceExperience,
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
  age_group: z.string().min(1, "Age group is required"),
  race_experience: z.string().min(1, "Race experience is required"),
  satisfaction_rating: z
    .string()
    .min(1, "Rating is required")
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 1 && num <= 5;
    }, "Rating must be between 1 and 5"),
  would_recommend: z.boolean(),
  feedback: z
    .string()
    .max(500, "Feedback must be less than 500 characters")
    .optional(),
  marketing_consent: z.boolean(),
});

interface SurveyFormProps {
  onSubmit: (data: SurveyFormData) => void;
  loading?: boolean;
  error?: string;
}

const ageGroups: { value: AgeGroup; label: string }[] = [
  { value: "under-18", label: "Under 18" },
  { value: "18-29", label: "18-29" },
  { value: "30-39", label: "30-39" },
  { value: "40-49", label: "40-49" },
  { value: "50-59", label: "50-59" },
  { value: "60-plus", label: "60+" },
];

const raceExperiences: { value: RaceExperience; label: string }[] = [
  { value: "first-time", label: "First time racer" },
  { value: "beginner", label: "Beginner (1-3 races)" },
  { value: "intermediate", label: "Intermediate (4-10 races)" },
  { value: "advanced", label: "Advanced (11+ races)" },
  { value: "elite", label: "Elite/Competitive" },
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
    defaultValues: {
      marketing_consent: false,
      would_recommend: true,
    },
  });

  const watchedFields = watch();
  const isFormValid =
    watchedFields.runner_name?.trim() &&
    watchedFields.runner_email?.trim() &&
    watchedFields.age_group &&
    watchedFields.race_experience &&
    watchedFields.satisfaction_rating;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card p-8">
        <form
          onSubmit={handleSubmit((data) => {
            const formData: SurveyFormData = {
              ...data,
              satisfaction_rating: parseInt(data.satisfaction_rating, 10),
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

          {/* Age Group */}
          <div>
            <label
              htmlFor="age_group"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Age Group *
            </label>
            <select
              id="age_group"
              {...register("age_group")}
              className="input"
              disabled={loading}
            >
              <option value="">Select your age group</option>
              {ageGroups.map((group) => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
            {errors.age_group && (
              <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                {errors.age_group.message}
              </p>
            )}
          </div>

          {/* Race Experience */}
          <div>
            <label
              htmlFor="race_experience"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Race Experience *
            </label>
            <select
              id="race_experience"
              {...register("race_experience")}
              className="input"
              disabled={loading}
            >
              <option value="">Select your experience level</option>
              {raceExperiences.map((exp) => (
                <option key={exp.value} value={exp.value}>
                  {exp.label}
                </option>
              ))}
            </select>
            {errors.race_experience && (
              <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                {errors.race_experience.message}
              </p>
            )}
          </div>

          {/* Satisfaction Rating */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              How satisfied are you with today's race? *
            </label>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={rating} className="flex items-center">
                  <input
                    type="radio"
                    value={rating}
                    {...register("satisfaction_rating")}
                    className="mr-2 accent-[var(--primary)]"
                    disabled={loading}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {rating}
                  </span>
                </label>
              ))}
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              1 = Very Dissatisfied, 5 = Very Satisfied
            </p>
            {errors.satisfaction_rating && (
              <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                {errors.satisfaction_rating.message}
              </p>
            )}
          </div>

          {/* Would Recommend */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register("would_recommend")}
                className="mr-2 accent-[var(--primary)]"
                disabled={loading}
              />
              <span
                className="text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                I would recommend this race to others
              </span>
            </label>
          </div>

          {/* Feedback */}
          <div>
            <label
              htmlFor="feedback"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Additional Feedback (Optional)
            </label>
            <textarea
              id="feedback"
              {...register("feedback")}
              rows={3}
              className="input"
              placeholder="Share any additional thoughts about your race experience..."
              disabled={loading}
            />
            {errors.feedback && (
              <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                {errors.feedback.message}
              </p>
            )}
          </div>

          {/* Marketing Consent */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                {...register("marketing_consent")}
                className="mr-2 mt-1 accent-[var(--primary)]"
                disabled={loading}
              />
              <span
                className="text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                I agree to receive marketing communications about future races
                and events
              </span>
            </label>
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
