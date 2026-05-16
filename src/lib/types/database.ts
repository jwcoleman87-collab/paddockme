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
      agreements: {
        Row: {
          alignment_state: Json | null
          created_at: string | null
          duration_months: number | null
          head_count: number | null
          id: string
          landowner_id: string
          livestock_owner_id: string
          match_id: string
          rate_per_head_week: number | null
          start_date: string | null
          status: string | null
          transport_required: boolean | null
          updated_at: string | null
        }
        Insert: {
          alignment_state?: Json | null
          created_at?: string | null
          duration_months?: number | null
          head_count?: number | null
          id?: string
          landowner_id: string
          livestock_owner_id: string
          match_id: string
          rate_per_head_week?: number | null
          start_date?: string | null
          status?: string | null
          transport_required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          alignment_state?: Json | null
          created_at?: string | null
          duration_months?: number | null
          head_count?: number | null
          id?: string
          landowner_id?: string
          livestock_owner_id?: string
          match_id?: string
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
      paddocks: {
        Row: {
          acres: number
          available_from: string | null
          capacity_head: number | null
          capacity_stock_type: string | null
          created_at: string | null
          description: string | null
          id: string
          loading_ramp: boolean | null
          min_duration_months: number | null
          owner_id: string
          pasture_type: string | null
          photos: string[] | null
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
          available_from?: string | null
          capacity_head?: number | null
          capacity_stock_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          loading_ramp?: boolean | null
          min_duration_months?: number | null
          owner_id: string
          pasture_type?: string | null
          photos?: string[] | null
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
          available_from?: string | null
          capacity_head?: number | null
          capacity_stock_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          loading_ramp?: boolean | null
          min_duration_months?: number | null
          owner_id?: string
          pasture_type?: string | null
          photos?: string[] | null
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

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">]

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
