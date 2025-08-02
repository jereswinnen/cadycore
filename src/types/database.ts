export interface Database {
  public: {
    Tables: {
      photos: {
        Row: {
          id: string;
          bib_number: string;
          preview_url: string;
          highres_url: string;
          watermark_url: string | null;
          uploaded_at: string;
          is_active: boolean;
          metadata: Record<string, any>;
          photo_order: number;
        };
        Insert: {
          id?: string;
          bib_number: string;
          preview_url: string;
          highres_url: string;
          watermark_url?: string | null;
          uploaded_at?: string;
          is_active?: boolean;
          metadata?: Record<string, any>;
          photo_order?: number;
        };
        Update: {
          id?: string;
          bib_number?: string;
          preview_url?: string;
          highres_url?: string;
          watermark_url?: string | null;
          uploaded_at?: string;
          is_active?: boolean;
          metadata?: Record<string, any>;
          photo_order?: number;
        };
      };
      survey_responses: {
        Row: {
          id: string;
          bib_number: string;
          selected_photo_ids: string[];
          runner_name: string | null;
          runner_email: string | null;
          age_group: string | null;
          race_experience: string | null;
          satisfaction_rating: number | null;
          would_recommend: boolean | null;
          feedback: string | null;
          marketing_consent: boolean;
          completed_at: string;
        };
        Insert: {
          id?: string;
          bib_number: string;
          selected_photo_ids: string[];
          runner_name?: string | null;
          runner_email?: string | null;
          age_group?: string | null;
          race_experience?: string | null;
          satisfaction_rating?: number | null;
          would_recommend?: boolean | null;
          feedback?: string | null;
          marketing_consent?: boolean;
          completed_at?: string;
        };
        Update: {
          id?: string;
          photo_id?: string;
          bib_number?: string;
          runner_name?: string | null;
          runner_email?: string | null;
          age_group?: string | null;
          race_experience?: string | null;
          satisfaction_rating?: number | null;
          would_recommend?: boolean | null;
          feedback?: string | null;
          marketing_consent?: boolean;
          completed_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          bib_number: string;
          selected_photo_ids: string[];
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          total_photos: number;
          price_per_photo: number;
          total_amount: number;
          currency: string;
          status: string;
          created_at: string;
          completed_at: string | null;
          email_sent: boolean;
          email_sent_at: string | null;
          email_attempts: number;
        };
        Insert: {
          id?: string;
          bib_number: string;
          selected_photo_ids: string[];
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          total_photos?: number;
          price_per_photo?: number;
          total_amount?: number;
          currency?: string;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
          email_sent?: boolean;
          email_sent_at?: string | null;
          email_attempts?: number;
        };
        Update: {
          id?: string;
          bib_number?: string;
          selected_photo_ids?: string[];
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          total_photos?: number;
          price_per_photo?: number;
          total_amount?: number;
          currency?: string;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
          email_sent?: boolean;
          email_sent_at?: string | null;
          email_attempts?: number;
        };
      };
      photo_access: {
        Row: {
          id: string;
          photo_id: string;
          bib_number: string;
          survey_completed: boolean;
          payment_completed: boolean;
          is_unlocked: boolean;
          unlocked_at: string | null;
          download_count: number;
          last_downloaded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          photo_id: string;
          bib_number: string;
          survey_completed?: boolean;
          payment_completed?: boolean;
          is_unlocked?: boolean;
          unlocked_at?: string | null;
          download_count?: number;
          last_downloaded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          photo_id?: string;
          bib_number?: string;
          survey_completed?: boolean;
          payment_completed?: boolean;
          is_unlocked?: boolean;
          unlocked_at?: string | null;
          download_count?: number;
          last_downloaded_at?: string | null;
          created_at?: string;
        };
      };
      photo_selections: {
        Row: {
          id: string;
          bib_number: string;
          photo_id: string;
          is_selected: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          bib_number: string;
          photo_id: string;
          is_selected?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          bib_number?: string;
          photo_id?: string;
          is_selected?: boolean;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          payment_id: string;
          photo_id: string;
          price_paid: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          photo_id: string;
          price_paid: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_id?: string;
          photo_id?: string;
          price_paid?: number;
          created_at?: string;
        };
      };
    };
  };
}