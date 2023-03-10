export interface Database {
  public: {
    Tables: {
      api_key_app: {
        Row: {
          api_key_id: string | null
          app_id: string | null
          id: string
        }
        Insert: {
          api_key_id?: string | null
          app_id?: string | null
          id?: string
        }
        Update: {
          api_key_id?: string | null
          app_id?: string | null
          id?: string
        }
      }
      api_key_developer: {
        Row: {
          api_key_id: string | null
          developer_id: string | null
          id: string
        }
        Insert: {
          api_key_id?: string | null
          developer_id?: string | null
          id?: string
        }
        Update: {
          api_key_id?: string | null
          developer_id?: string | null
          id?: string
        }
      }
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
      }
      apps: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
      }
      app_channel: {
        Row: {
          app_id: string | null
          channel_id: string | null
          id: string
        }
        Insert: {
          app_id?: string | null
          channel_id?: string | null
          id?: string
        }
        Update: {
          app_id?: string | null
          channel_id?: string | null
          id?: string
        }
      }
      channels: {
        Row: {
          created_at: string
          id: string
          name: string
          last_message?: string | null
          owner_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          last_message?: string | null
          owner_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          last_message?: string | null
          owner_user_id?: string | null
          updated_at?: string
        }
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
      }
      company_app: {
        Row: {
          app_id: string | null
          company_id: string | null
          id: string
        }
        Insert: {
          app_id?: string | null
          company_id?: string | null
          id?: string
        }
        Update: {
          app_id?: string | null
          company_id?: string | null
          id?: string
        }
      }
      company_developer: {
        Row: {
          company_id: string | null
          developer_owner_id: string | null
          id: string
        }
        Insert: {
          company_id?: string | null
          developer_owner_id?: string | null
          id?: string
        }
        Update: {
          company_id?: string | null
          developer_owner_id?: string | null
          id?: string
        }
      }
      developer_app: {
        Row: {
          app_id: string | null
          developer_id: string | null
          id: string
        }
        Insert: {
          app_id?: string | null
          developer_id?: string | null
          id?: string
        }
        Update: {
          app_id?: string | null
          developer_id?: string | null
          id?: string
        }
      }
      developers: {
        Row: {
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
      }
      channel_message: {
        Row: {
          channel_id: string | null
          id: string
          message_id: string | null
        }
        Insert: {
          channel_id?: string | null
          id?: string
          message_id?: string | null
        }
        Update: {
          channel_id?: string | null
          id?: string
          message_id?: string | null
        }
      }
      user_message: {
        Row: {
          id: string
          message_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          updated_at?: string
        }
      }
      app_user: {
        Row: {
          app_id: string | null
          external_user_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          app_id?: string | null
          external_user_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          app_id?: string | null
          external_user_id?: string
          id?: string
          user_id?: string | null
        }
      }
      channel_user: {
        Row: {
          channel_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          id?: string
          user_id?: string | null
        }
      }
      users: {
        Row: {
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      pricing_plan_interval: "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}