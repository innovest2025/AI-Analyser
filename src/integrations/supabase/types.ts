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
      ai_model_metrics: {
        Row: {
          additional_params: Json | null
          evaluation_date: string
          id: string
          intersection_id: string | null
          metric_type: string
          metric_value: number
          model_name: string
          model_version: string
          test_dataset: string | null
        }
        Insert: {
          additional_params?: Json | null
          evaluation_date?: string
          id?: string
          intersection_id?: string | null
          metric_type: string
          metric_value: number
          model_name: string
          model_version: string
          test_dataset?: string | null
        }
        Update: {
          additional_params?: Json | null
          evaluation_date?: string
          id?: string
          intersection_id?: string | null
          metric_type?: string
          metric_value?: number
          model_name?: string
          model_version?: string
          test_dataset?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_model_metrics_intersection_id_fkey"
            columns: ["intersection_id"]
            isOneToOne: false
            referencedRelation: "intersections"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_reports: {
        Row: {
          created_at: string
          description: string
          downvotes: number | null
          id: string
          location: Json
          photos: string[] | null
          report_type: string
          reporter_id: string | null
          resolved_at: string | null
          severity: string
          title: string
          upvotes: number | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          description: string
          downvotes?: number | null
          id?: string
          location: Json
          photos?: string[] | null
          report_type: string
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: string
          title: string
          upvotes?: number | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          downvotes?: number | null
          id?: string
          location?: Json
          photos?: string[] | null
          report_type?: string
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: string
          title?: string
          upvotes?: number | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      emergency_responses: {
        Row: {
          actual_arrival: string | null
          created_at: string
          created_by: string | null
          destination_location: Json
          emergency_type: string
          estimated_arrival: string | null
          id: string
          priority_level: number | null
          response_time_seconds: number | null
          route_coordinates: Json | null
          signals_overridden: string[] | null
          source_location: Json
          status: string
          vehicle_id: string | null
        }
        Insert: {
          actual_arrival?: string | null
          created_at?: string
          created_by?: string | null
          destination_location: Json
          emergency_type: string
          estimated_arrival?: string | null
          id?: string
          priority_level?: number | null
          response_time_seconds?: number | null
          route_coordinates?: Json | null
          signals_overridden?: string[] | null
          source_location: Json
          status?: string
          vehicle_id?: string | null
        }
        Update: {
          actual_arrival?: string | null
          created_at?: string
          created_by?: string | null
          destination_location?: Json
          emergency_type?: string
          estimated_arrival?: string | null
          id?: string
          priority_level?: number | null
          response_time_seconds?: number | null
          route_coordinates?: Json | null
          signals_overridden?: string[] | null
          source_location?: Json
          status?: string
          vehicle_id?: string | null
        }
        Relationships: []
      }
      intersections: {
        Row: {
          created_at: string
          id: string
          location: Json
          name: string
          signal_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location: Json
          name: string
          signal_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: Json
          name?: string
          signal_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          intersection_id: string | null
          location: Json | null
          message: string
          severity: string
          title: string
          type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          intersection_id?: string | null
          location?: Json | null
          message: string
          severity: string
          title: string
          type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          intersection_id?: string | null
          location?: Json | null
          message?: string
          severity?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_alerts_intersection_id_fkey"
            columns: ["intersection_id"]
            isOneToOne: false
            referencedRelation: "intersections"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_data: {
        Row: {
          average_speed: number
          congestion_level: string
          id: string
          intersection_id: string
          recorded_at: string
          vehicle_count: number
          wait_time_seconds: number
        }
        Insert: {
          average_speed?: number
          congestion_level?: string
          id?: string
          intersection_id: string
          recorded_at?: string
          vehicle_count?: number
          wait_time_seconds?: number
        }
        Update: {
          average_speed?: number
          congestion_level?: string
          id?: string
          intersection_id?: string
          recorded_at?: string
          vehicle_count?: number
          wait_time_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "traffic_data_intersection_id_fkey"
            columns: ["intersection_id"]
            isOneToOne: false
            referencedRelation: "intersections"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_events: {
        Row: {
          affected_areas: string[] | null
          created_at: string
          created_by: string | null
          end_time: string
          expected_crowd: number | null
          id: string
          impact_level: string
          location: Json
          name: string
          special_instructions: string | null
          start_time: string
          traffic_multiplier: number | null
          type: string
        }
        Insert: {
          affected_areas?: string[] | null
          created_at?: string
          created_by?: string | null
          end_time: string
          expected_crowd?: number | null
          id?: string
          impact_level?: string
          location: Json
          name: string
          special_instructions?: string | null
          start_time: string
          traffic_multiplier?: number | null
          type: string
        }
        Update: {
          affected_areas?: string[] | null
          created_at?: string
          created_by?: string | null
          end_time?: string
          expected_crowd?: number | null
          id?: string
          impact_level?: string
          location?: Json
          name?: string
          special_instructions?: string | null
          start_time?: string
          traffic_multiplier?: number | null
          type?: string
        }
        Relationships: []
      }
      traffic_incidents: {
        Row: {
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          intersection_id: string | null
          location: Json
          reported_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          intersection_id?: string | null
          location: Json
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          intersection_id?: string | null
          location?: Json
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "traffic_incidents_intersection_id_fkey"
            columns: ["intersection_id"]
            isOneToOne: false
            referencedRelation: "intersections"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_predictions: {
        Row: {
          confidence_score: number
          created_at: string
          id: string
          intersection_id: string
          model_version: string
          predicted_congestion_level: string
          predicted_for: string
          predicted_speed: number
          predicted_vehicle_count: number
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          id?: string
          intersection_id: string
          model_version?: string
          predicted_congestion_level: string
          predicted_for: string
          predicted_speed: number
          predicted_vehicle_count: number
        }
        Update: {
          confidence_score?: number
          created_at?: string
          id?: string
          intersection_id?: string
          model_version?: string
          predicted_congestion_level?: string
          predicted_for?: string
          predicted_speed?: number
          predicted_vehicle_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "traffic_predictions_intersection_id_fkey"
            columns: ["intersection_id"]
            isOneToOne: false
            referencedRelation: "intersections"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          context: string | null
          created_at: string
          id: string
          key_name: string
          language_code: string
          translation: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          key_name: string
          language_code: string
          translation: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          key_name?: string
          language_code?: string
          translation?: string
        }
        Relationships: []
      }
      vehicle_detections: {
        Row: {
          bounding_box: Json | null
          confidence_score: number
          detection_time: string
          direction: string | null
          id: string
          intersection_id: string
          is_violation: boolean | null
          lane_number: number | null
          speed_kmh: number | null
          vehicle_type: string
          violation_type: string | null
        }
        Insert: {
          bounding_box?: Json | null
          confidence_score?: number
          detection_time?: string
          direction?: string | null
          id?: string
          intersection_id: string
          is_violation?: boolean | null
          lane_number?: number | null
          speed_kmh?: number | null
          vehicle_type: string
          violation_type?: string | null
        }
        Update: {
          bounding_box?: Json | null
          confidence_score?: number
          detection_time?: string
          direction?: string | null
          id?: string
          intersection_id?: string
          is_violation?: boolean | null
          lane_number?: number | null
          speed_kmh?: number | null
          vehicle_type?: string
          violation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_detections_intersection_id_fkey"
            columns: ["intersection_id"]
            isOneToOne: false
            referencedRelation: "intersections"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_data: {
        Row: {
          aqi: number | null
          humidity: number | null
          id: string
          impact_factor: number | null
          location: Json
          rainfall: number | null
          recorded_at: string
          temperature: number | null
          visibility_km: number | null
          weather_condition: string | null
          wind_speed: number | null
        }
        Insert: {
          aqi?: number | null
          humidity?: number | null
          id?: string
          impact_factor?: number | null
          location: Json
          rainfall?: number | null
          recorded_at?: string
          temperature?: number | null
          visibility_km?: number | null
          weather_condition?: string | null
          wind_speed?: number | null
        }
        Update: {
          aqi?: number | null
          humidity?: number | null
          id?: string
          impact_factor?: number | null
          location?: Json
          rainfall?: number | null
          recorded_at?: string
          temperature?: number | null
          visibility_km?: number | null
          weather_condition?: string | null
          wind_speed?: number | null
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
