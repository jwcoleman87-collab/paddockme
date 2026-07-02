export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agistment_requests: {
        Row: {
          breed: string | null
          created_at: string | null
          duration: string
          head_count: number
          id: string
          location: unknown
          origin_address: string | null
          origin_place_id: string | null
          preferred_regions: string[]
          requester_id: string
          required_pasture: string | null
          required_ramp: boolean | null
          required_shelter: boolean | null
          required_water: boolean | null
          required_yards: boolean | null
          status: string | null
          stock_type: string
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          breed?: string | null
          created_at?: string | null
          duration: string
          head_count: number
          id?: string
          location?: unknown
          origin_address?: string | null
          origin_place_id?: string | null
          preferred_regions: string[]
          requester_id: string
          required_pasture?: string | null
          required_ramp?: boolean | null
          required_shelter?: boolean | null
          required_water?: boolean | null
          required_yards?: boolean | null
          status?: string | null
          stock_type: string
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          breed?: string | null
          created_at?: string | null
          duration?: string
          head_count?: number
          id?: string
          location?: unknown
          origin_address?: string | null
          origin_place_id?: string | null
          preferred_regions?: string[]
          requester_id?: string
          required_pasture?: string | null
          required_ramp?: boolean | null
          required_shelter?: boolean | null
          required_water?: boolean | null
          required_yards?: boolean | null
          status?: string | null
          stock_type?: string
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agistment_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_artefacts: {
        Row: {
          agreement_id: string
          created_at: string
          description: string | null
          id: string
          kind: string
          label: string
          metadata: Json
          section_key: string | null
          storage_path: string | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          agreement_id: string
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          label: string
          metadata?: Json
          section_key?: string | null
          storage_path?: string | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          agreement_id?: string
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          label?: string
          metadata?: Json
          section_key?: string | null
          storage_path?: string | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreement_artefacts_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreement_artefacts_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_sections: {
        Row: {
          agreed_by_a: boolean
          agreed_by_b: boolean
          agreement_id: string
          created_at: string
          farmer_a_value: Json
          farmer_b_value: Json
          id: string
          label: string
          section_key: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          agreed_by_a?: boolean
          agreed_by_b?: boolean
          agreement_id: string
          created_at?: string
          farmer_a_value?: Json
          farmer_b_value?: Json
          id?: string
          label: string
          section_key: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          agreed_by_a?: boolean
          agreed_by_b?: boolean
          agreement_id?: string
          created_at?: string
          farmer_a_value?: Json
          farmer_b_value?: Json
          id?: string
          label?: string
          section_key?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreement_sections_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      agreements: {
        Row: {
          alignment_state: Json | null
          created_at: string | null
          destination_location: unknown
          destination_address: string | null
          duration_months: number | null
          head_count: number | null
          id: string
          landowner_id: string
          livestock_owner_id: string
          match_id: string
          pickup_location: unknown
          pickup_address: string | null
          rate_per_head_week: number | null
          start_date: string | null
          status: string | null
          transport_required: boolean | null
          updated_at: string | null
        }
        Insert: {
          alignment_state?: Json | null
          created_at?: string | null
          destination_location?: unknown
          destination_address?: string | null
          duration_months?: number | null
          head_count?: number | null
          id?: string
          landowner_id: string
          livestock_owner_id: string
          match_id: string
          pickup_location?: unknown
          pickup_address?: string | null
          rate_per_head_week?: number | null
          start_date?: string | null
          status?: string | null
          transport_required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          alignment_state?: Json | null
          created_at?: string | null
          destination_location?: unknown
          destination_address?: string | null
          duration_months?: number | null
          head_count?: number | null
          id?: string
          landowner_id?: string
          livestock_owner_id?: string
          match_id?: string
          pickup_location?: unknown
          pickup_address?: string | null
          rate_per_head_week?: number | null
          start_date?: string | null
          status?: string | null
          transport_required?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreements_landowner_id_fkey"
            columns: ["landowner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_livestock_owner_id_fkey"
            columns: ["livestock_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_chat_messages: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_name: string | null
          image_path: string | null
          sender_name: string
          sender_role: string
          workspace_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_name?: string | null
          image_path?: string | null
          sender_name: string
          sender_role: string
          workspace_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_name?: string | null
          image_path?: string | null
          sender_name?: string
          sender_role?: string
          workspace_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string | null
          id: string
          match_reasons: Json | null
          match_score: number
          paddock_id: string
          request_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_reasons?: Json | null
          match_score: number
          paddock_id: string
          request_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_reasons?: Json | null
          match_score?: number
          paddock_id?: string
          request_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_paddock_id_fkey"
            columns: ["paddock_id"]
            isOneToOne: false
            referencedRelation: "paddocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "agistment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          agreement_id: string | null
          body: string
          created_at: string
          id: string
          section_id: string | null
          sender_id: string
          transport_job_id: string | null
        }
        Insert: {
          agreement_id?: string | null
          body: string
          created_at?: string
          id?: string
          section_id?: string | null
          sender_id: string
          transport_job_id?: string | null
        }
        Update: {
          agreement_id?: string | null
          body?: string
          created_at?: string
          id?: string
          section_id?: string | null
          sender_id?: string
          transport_job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_transport_job_id_fkey"
            columns: ["transport_job_id"]
            isOneToOne: false
            referencedRelation: "transport_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      paddocks: {
        Row: {
          acres: number
          address: string | null
          available_from: string | null
          capacity_head: number | null
          capacity_stock_type: string | null
          created_at: string | null
          description: string | null
          id: string
          loading_ramp: boolean | null
          location: unknown
          min_duration_months: number | null
          owner_id: string
          pasture_type: string | null
          photos: string[] | null
          place_id: string | null
          rate_per_head_week: number | null
          region: string
          shelter: boolean | null
          state: string
          status: string | null
          title: string
          updated_at: string | null
          water_type: string[] | null
          yards: boolean | null
        }
        Insert: {
          acres: number
          address?: string | null
          available_from?: string | null
          capacity_head?: number | null
          capacity_stock_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          loading_ramp?: boolean | null
          location?: unknown
          min_duration_months?: number | null
          owner_id: string
          pasture_type?: string | null
          photos?: string[] | null
          place_id?: string | null
          rate_per_head_week?: number | null
          region: string
          shelter?: boolean | null
          state: string
          status?: string | null
          title: string
          updated_at?: string | null
          water_type?: string[] | null
          yards?: boolean | null
        }
        Update: {
          acres?: number
          address?: string | null
          available_from?: string | null
          capacity_head?: number | null
          capacity_stock_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          loading_ramp?: boolean | null
          location?: unknown
          min_duration_months?: number | null
          owner_id?: string
          pasture_type?: string | null
          photos?: string[] | null
          place_id?: string | null
          rate_per_head_week?: number | null
          region?: string
          shelter?: boolean | null
          state?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          water_type?: string[] | null
          yards?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "paddocks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          abn: string | null
          abn_verified: boolean | null
          account_types: string[] | null
          created_at: string | null
          full_name: string | null
          id: string
          id_verified: boolean | null
          location: unknown
          phone: string | null
          property_verified: boolean | null
          rating: number | null
          regions: string[] | null
          stock_types: string[] | null
          successful_matches: number | null
          updated_at: string | null
        }
        Insert: {
          abn?: string | null
          abn_verified?: boolean | null
          account_types?: string[] | null
          created_at?: string | null
          full_name?: string | null
          id: string
          id_verified?: boolean | null
          location?: unknown
          phone?: string | null
          property_verified?: boolean | null
          rating?: number | null
          regions?: string[] | null
          stock_types?: string[] | null
          successful_matches?: number | null
          updated_at?: string | null
        }
        Update: {
          abn?: string | null
          abn_verified?: boolean | null
          account_types?: string[] | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          id_verified?: boolean | null
          location?: unknown
          phone?: string | null
          property_verified?: boolean | null
          rating?: number | null
          regions?: string[] | null
          stock_types?: string[] | null
          successful_matches?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transport_artefacts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          kind: string
          label: string
          metadata: Json
          section_key: string | null
          storage_path: string | null
          transport_job_id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          label: string
          metadata?: Json
          section_key?: string | null
          storage_path?: string | null
          transport_job_id: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          label?: string
          metadata?: Json
          section_key?: string | null
          storage_path?: string | null
          transport_job_id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_artefacts_transport_job_id_fkey"
            columns: ["transport_job_id"]
            isOneToOne: false
            referencedRelation: "transport_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_artefacts_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_capacity: {
        Row: {
          created_at: string
          destination_region: string
          driver_id: string
          earliest_date: string
          head_capacity: number
          id: string
          latest_date: string
          notes: string | null
          origin_region: string
          rate_amount: number | null
          rate_basis: string | null
          status: string
          stock_types: string[]
          truck_label: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination_region: string
          driver_id: string
          earliest_date: string
          head_capacity: number
          id?: string
          latest_date: string
          notes?: string | null
          origin_region: string
          rate_amount?: number | null
          rate_basis?: string | null
          status?: string
          stock_types?: string[]
          truck_label?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination_region?: string
          driver_id?: string
          earliest_date?: string
          head_capacity?: number
          id?: string
          latest_date?: string
          notes?: string | null
          origin_region?: string
          rate_amount?: number | null
          rate_basis?: string | null
          status?: string
          stock_types?: string[]
          truck_label?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_capacity_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_jobs: {
        Row: {
          accepted_quote_id: string | null
          agreement_id: string
          coordination_state: Json | null
          created_at: string
          current_location: unknown
          destination_address: string | null
          destination_location: unknown
          driver_id: string | null
          id: string
          landowner_id: string
          livestock_count: string | null
          livestock_owner_id: string
          pickup_address: string | null
          pickup_location: unknown
          preferred_date: string | null
          route_summary: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_quote_id?: string | null
          agreement_id: string
          coordination_state?: Json | null
          created_at?: string
          current_location?: unknown
          destination_address?: string | null
          destination_location?: unknown
          driver_id?: string | null
          id?: string
          landowner_id: string
          livestock_count?: string | null
          livestock_owner_id: string
          pickup_address?: string | null
          pickup_location?: unknown
          preferred_date?: string | null
          route_summary?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_quote_id?: string | null
          agreement_id?: string
          coordination_state?: Json | null
          created_at?: string
          current_location?: unknown
          destination_address?: string | null
          destination_location?: unknown
          driver_id?: string | null
          id?: string
          landowner_id?: string
          livestock_count?: string | null
          livestock_owner_id?: string
          pickup_address?: string | null
          pickup_location?: unknown
          preferred_date?: string | null
          route_summary?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_jobs_accepted_quote_id_fkey"
            columns: ["accepted_quote_id"]
            isOneToOne: false
            referencedRelation: "transport_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_jobs_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_jobs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_jobs_landowner_id_fkey"
            columns: ["landowner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_jobs_livestock_owner_id_fkey"
            columns: ["livestock_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_quotes: {
        Row: {
          accepted_at: string | null
          amount: number
          basis: string
          created_at: string
          currency: string
          id: string
          note: string | null
          payment_terms: string | null
          previous_quote_id: string | null
          proposed_by: string
          status: string
          transport_job_id: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          amount: number
          basis: string
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          payment_terms?: string | null
          previous_quote_id?: string | null
          proposed_by: string
          status?: string
          transport_job_id: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          amount?: number
          basis?: string
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          payment_terms?: string | null
          previous_quote_id?: string | null
          proposed_by?: string
          status?: string
          transport_job_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_quotes_previous_quote_id_fkey"
            columns: ["previous_quote_id"]
            isOneToOne: false
            referencedRelation: "transport_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_quotes_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_quotes_transport_job_id_fkey"
            columns: ["transport_job_id"]
            isOneToOne: false
            referencedRelation: "transport_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_status_events: {
        Row: {
          changed_by: string
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          to_status: string
          transport_job_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status: string
          transport_job_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status?: string
          transport_job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_status_events_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_status_events_transport_job_id_fkey"
            columns: ["transport_job_id"]
            isOneToOne: false
            referencedRelation: "transport_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
