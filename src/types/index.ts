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
  social_media_preference?: "posed" | "action";
  waiting_stops_buying?: "yes" | "no";
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
  status: "pending" | "completed" | "failed" | "cancelled";
  created_at: string;
  completed_at?: string;
  email_sent?: boolean;
  email_sent_at?: string;
  email_attempts?: number;
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
  social_media_preference: "posed" | "action";
  waiting_stops_buying: "yes" | "no";
}

export interface SurveySubmissionData extends SurveyFormData {
  selected_photo_ids: string[];
}

export interface SurveyFormInput {
  runner_name: string;
  runner_email: string;
  social_media_preference: string;
  waiting_stops_buying: string;
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
  payment?: Pick<
    Payment,
    "id" | "email_sent" | "email_sent_at" | "email_attempts"
  > | null;
}

export type SocialMediaPreference = "posed" | "action";

export type WaitingStopsBuying = "yes" | "no";
