export interface Photo {
  id: string;
  bib_number: string;
  preview_url: string;
  highres_url: string;
  watermark_url?: string;
  uploaded_at: string;
  is_active: boolean;
  metadata: Record<string, any>;
  photo_order?: number;
}

export interface SurveyResponse {
  id: string;
  bib_number: string;
  selected_photo_ids: string[];
  runner_name?: string;
  runner_email?: string;
  age_group?: string;
  race_experience?: string;
  satisfaction_rating?: number;
  would_recommend?: boolean;
  feedback?: string;
  marketing_consent: boolean;
  completed_at: string;
}

export interface Payment {
  id: string;
  bib_number: string;
  selected_photo_ids: string[];
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  total_photos: number;
  price_per_photo: number;
  total_amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

export interface PhotoAccess {
  id: string;
  photo_id: string;
  bib_number: string;
  survey_completed: boolean;
  payment_completed: boolean;
  is_unlocked: boolean;
  unlocked_at?: string;
  download_count: number;
  last_downloaded_at?: string;
  created_at: string;
}

export interface SurveyFormData {
  runner_name: string;
  runner_email: string;
  age_group: string;
  race_experience: string;
  satisfaction_rating: number;
  would_recommend: boolean;
  feedback?: string;
  marketing_consent: boolean;
  selected_photo_ids: string[];
}

export interface SurveyFormInput {
  runner_name: string;
  runner_email: string;
  age_group: string;
  race_experience: string;
  satisfaction_rating: string;
  would_recommend: boolean;
  feedback?: string;
  marketing_consent: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PhotoWithAccess extends Photo {
  access?: PhotoAccess;
  selected?: boolean;
}

export interface PhotoSelection {
  id: string;
  bib_number: string;
  photo_id: string;
  is_selected: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  payment_id: string;
  photo_id: string;
  price_paid: number;
  created_at: string;
}

export interface PhotosWithSelections {
  photos: PhotoWithAccess[];
  selections: PhotoSelection[];
  totalSelected: number;
  totalPrice: number;
  pricePerPhoto: number;
}

export type AgeGroup = 
  | 'under-18'
  | '18-29'
  | '30-39'
  | '40-49'
  | '50-59'
  | '60-plus';

export type RaceExperience = 
  | 'first-time'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'elite';

export type SatisfactionRating = 1 | 2 | 3 | 4 | 5;