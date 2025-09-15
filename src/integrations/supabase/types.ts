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
