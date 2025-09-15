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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_analysis: {
        Row: {
          analysis_type: string
          confidence_score: number | null
          created_at: string
          id: string
          prompt: string
          response: string
          unit_id: string
        }
        Insert: {
          analysis_type: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          prompt: string
          response: string
          unit_id: string
        }
        Update: {
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          prompt?: string
          response?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_history: {
        Row: {
          created_at: string
          date: string
          id: string
          message: string | null
          severity: string
          type: string
          unit_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          message?: string | null
          severity: string
          type: string
          unit_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          message?: string | null
          severity?: string
          type?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_history_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      district_stats: {
        Row: {
          amber_count: number | null
          avg_risk_score: number | null
          green_count: number | null
          id: string
          name: string
          red_count: number | null
          sla_compliance: number | null
          total_units: number | null
          updated_at: string
        }
        Insert: {
          amber_count?: number | null
          avg_risk_score?: number | null
          green_count?: number | null
          id?: string
          name: string
          red_count?: number | null
          sla_compliance?: number | null
          total_units?: number | null
          updated_at?: string
        }
        Update: {
          amber_count?: number | null
          avg_risk_score?: number | null
          green_count?: number | null
          id?: string
          name?: string
          red_count?: number | null
          sla_compliance?: number | null
          total_units?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          bucket_id: string
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          id: string
          is_processed: boolean | null
          metadata: Json | null
          mime_type: string
          original_name: string
          processed_at: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          description?: string | null
          file_path: string
          file_size: number
          id?: string
          is_processed?: boolean | null
          metadata?: Json | null
          mime_type: string
          original_name: string
          processed_at?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number
          id?: string
          is_processed?: boolean | null
          metadata?: Json | null
          mime_type?: string
          original_name?: string
          processed_at?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read_at: string | null
          sent_email: boolean | null
          sent_sms: boolean | null
          severity: string
          title: string
          type: string
          unit_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read_at?: string | null
          sent_email?: boolean | null
          sent_sms?: boolean | null
          severity: string
          title: string
          type: string
          unit_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read_at?: string | null
          sent_email?: boolean | null
          sent_sms?: boolean | null
          severity?: string
          title?: string
          type?: string
          unit_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          display_name: string | null
          district_access: string[] | null
          email_notifications: boolean | null
          id: string
          phone_number: string | null
          role: string
          sms_notifications: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          display_name?: string | null
          district_access?: string[] | null
          email_notifications?: boolean | null
          id: string
          phone_number?: string | null
          role?: string
          sms_notifications?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          display_name?: string | null
          district_access?: string[] | null
          email_notifications?: boolean | null
          id?: string
          phone_number?: string | null
          role?: string
          sms_notifications?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          data: Json
          description: string | null
          expires_at: string | null
          file_url: string | null
          filters: Json | null
          generated_at: string | null
          generated_by: string | null
          id: string
          report_type: string
          scheduled_for: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          data: Json
          description?: string | null
          expires_at?: string | null
          file_url?: string | null
          filters?: Json | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          report_type: string
          scheduled_for?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          data?: Json
          description?: string | null
          expires_at?: string | null
          file_url?: string | null
          filters?: Json | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          report_type?: string
          scheduled_for?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shap_drivers: {
        Row: {
          created_at: string
          feature: string
          id: string
          impact: number
          unit_id: string
          value: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          impact: number
          unit_id: string
          value: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          impact?: number
          unit_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "shap_drivers_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          arrears: number | null
          created_at: string
          disconnect_flag: boolean | null
          district: string
          id: string
          kwh_consumption: number[] | null
          last_updated: string
          name: string
          peer_percentile: number | null
          risk_score: number
          service_no: string
          tier: string
          updated_at: string
          urn: string
        }
        Insert: {
          arrears?: number | null
          created_at?: string
          disconnect_flag?: boolean | null
          district: string
          id?: string
          kwh_consumption?: number[] | null
          last_updated?: string
          name: string
          peer_percentile?: number | null
          risk_score?: number
          service_no: string
          tier: string
          updated_at?: string
          urn: string
        }
        Update: {
          arrears?: number | null
          created_at?: string
          disconnect_flag?: boolean | null
          district?: string
          id?: string
          kwh_consumption?: number[] | null
          last_updated?: string
          name?: string
          peer_percentile?: number | null
          risk_score?: number
          service_no?: string
          tier?: string
          updated_at?: string
          urn?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          unit_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          unit_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          unit_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
