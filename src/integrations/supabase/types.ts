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
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          image_url: string | null
          name: string
          product_type: Database["public"]["Enums"]["product_type"]
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          product_type?: Database["public"]["Enums"]["product_type"]
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      employee_reports: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          problems: string | null
          report_date: string
          tasks_completed: string
          uploaded_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          problems?: string | null
          report_date?: string
          tasks_completed: string
          uploaded_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          problems?: string | null
          report_date?: string
          tasks_completed?: string
          uploaded_count?: number
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          fingerprint: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          fingerprint: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          attributes: Json
          brand: string | null
          category_id: string | null
          condition: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          district: string | null
          featured_image: string | null
          id: string
          is_featured: boolean
          latitude: number | null
          like_count: number
          location: string | null
          longitude: number | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          quantity: number
          sector: string | null
          status: Database["public"]["Enums"]["product_status"]
          tags: string[] | null
          title: string
          updated_at: string
          video_url: string | null
          view_count: number
          whatsapp_number: string | null
        }
        Insert: {
          attributes?: Json
          brand?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          district?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean
          latitude?: number | null
          like_count?: number
          location?: string | null
          longitude?: number | null
          price?: number
          product_type?: Database["public"]["Enums"]["product_type"]
          quantity?: number
          sector?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          video_url?: string | null
          view_count?: number
          whatsapp_number?: string | null
        }
        Update: {
          attributes?: Json
          brand?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          district?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean
          latitude?: number | null
          like_count?: number
          location?: string | null
          longitude?: number | null
          price?: number
          product_type?: Database["public"]["Enums"]["product_type"]
          quantity?: number
          sector?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string | null
          view_count?: number
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          must_change_password: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "employee"
      product_status: "available" | "sold" | "pending" | "reserved"
      product_type:
        | "real_estate"
        | "land"
        | "vehicle"
        | "car"
        | "motorcycle"
        | "truck"
        | "computer"
        | "laptop"
        | "smartphone"
        | "tablet"
        | "electronics"
        | "tv"
        | "camera"
        | "furniture"
        | "fashion"
        | "accessories"
        | "rental"
        | "service"
        | "home_equipment"
        | "office_equipment"
        | "other"
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
    Enums: {
      app_role: ["super_admin", "employee"],
      product_status: ["available", "sold", "pending", "reserved"],
      product_type: [
        "real_estate",
        "land",
        "vehicle",
        "car",
        "motorcycle",
        "truck",
        "computer",
        "laptop",
        "smartphone",
        "tablet",
        "electronics",
        "tv",
        "camera",
        "furniture",
        "fashion",
        "accessories",
        "rental",
        "service",
        "home_equipment",
        "office_equipment",
        "other",
      ],
    },
  },
} as const
