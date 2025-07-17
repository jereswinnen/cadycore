'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SurveyFormData, AgeGroup, RaceExperience } from '@/types';
import { validateEmail } from '@/lib/utils';

const surveySchema = z.object({
  runner_name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  runner_email: z.string().min(1, 'Email is required').refine(validateEmail, 'Invalid email format'),
  age_group: z.string().min(1, 'Age group is required'),
  race_experience: z.string().min(1, 'Race experience is required'),
  satisfaction_rating: z.string().min(1, 'Rating is required').transform((val) => parseInt(val, 10)).refine((val) => val >= 1 && val <= 5, 'Rating must be between 1 and 5'),
  would_recommend: z.boolean(),
  feedback: z.string().max(500, 'Feedback must be less than 500 characters').optional(),
  marketing_consent: z.boolean(),
});

interface SurveyFormProps {
  onSubmit: (data: SurveyFormData) => void;
  loading?: boolean;
  error?: string;
}

const ageGroups: { value: AgeGroup; label: string }[] = [
  { value: 'under-18', label: 'Under 18' },
  { value: '18-29', label: '18-29' },
  { value: '30-39', label: '30-39' },
  { value: '40-49', label: '40-49' },
  { value: '50-59', label: '50-59' },
  { value: '60-plus', label: '60+' },
];

const raceExperiences: { value: RaceExperience; label: string }[] = [
  { value: 'first-time', label: 'First time racer' },
  { value: 'beginner', label: 'Beginner (1-3 races)' },
  { value: 'intermediate', label: 'Intermediate (4-10 races)' },
  { value: 'advanced', label: 'Advanced (11+ races)' },
  { value: 'elite', label: 'Elite/Competitive' },
];

export default function SurveyForm({ onSubmit, loading = false, error }: SurveyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      marketing_consent: false,
      would_recommend: true,
    },
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Quick Survey
        </h2>
        <p className="text-gray-600 mb-6">
          Please complete this quick survey to unlock your photo.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="runner_name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="runner_name"
              {...register('runner_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            {errors.runner_name && (
              <p className="mt-1 text-sm text-red-600">{errors.runner_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="runner_email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="runner_email"
              {...register('runner_email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            {errors.runner_email && (
              <p className="mt-1 text-sm text-red-600">{errors.runner_email.message}</p>
            )}
          </div>

          {/* Age Group */}
          <div>
            <label htmlFor="age_group" className="block text-sm font-medium text-gray-700 mb-2">
              Age Group *
            </label>
            <select
              id="age_group"
              {...register('age_group')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select your age group</option>
              {ageGroups.map(group => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
            {errors.age_group && (
              <p className="mt-1 text-sm text-red-600">{errors.age_group.message}</p>
            )}
          </div>

          {/* Race Experience */}
          <div>
            <label htmlFor="race_experience" className="block text-sm font-medium text-gray-700 mb-2">
              Race Experience *
            </label>
            <select
              id="race_experience"
              {...register('race_experience')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select your experience level</option>
              {raceExperiences.map(exp => (
                <option key={exp.value} value={exp.value}>
                  {exp.label}
                </option>
              ))}
            </select>
            {errors.race_experience && (
              <p className="mt-1 text-sm text-red-600">{errors.race_experience.message}</p>
            )}
          </div>

          {/* Satisfaction Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How satisfied are you with today's race? *
            </label>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map(rating => (
                <label key={rating} className="flex items-center">
                  <input
                    type="radio"
                    value={rating}
                    {...register('satisfaction_rating')}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="text-sm">{rating}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">1 = Very Dissatisfied, 5 = Very Satisfied</p>
            {errors.satisfaction_rating && (
              <p className="mt-1 text-sm text-red-600">{errors.satisfaction_rating.message}</p>
            )}
          </div>

          {/* Would Recommend */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('would_recommend')}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">
                I would recommend this race to others
              </span>
            </label>
          </div>

          {/* Feedback */}
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Feedback (Optional)
            </label>
            <textarea
              id="feedback"
              {...register('feedback')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share any additional thoughts about your race experience..."
              disabled={loading}
            />
            {errors.feedback && (
              <p className="mt-1 text-sm text-red-600">{errors.feedback.message}</p>
            )}
          </div>

          {/* Marketing Consent */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                {...register('marketing_consent')}
                className="mr-2 mt-1"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">
                I agree to receive marketing communications about future races and events
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Submitting...' : 'Continue to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}