export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_user_id: string
        }
        Insert: {
          created_at: string
          id?: string
          name: string
          owner_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string
        }
      }
      messages: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          message: string
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at: string
          id?: string
          message: string
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          message?: string
          user_id?: string | null
        }
      }
      user_conversation: {
        Row: {
          conversation_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          user_id?: string | null
        }
      }
      users: {
        Row: {
          created_at: string
          id: string
          username: string
          apikey?: string
        }
        Insert: {
          created_at: string
          id?: string
          username: string
          apikey?: string
        }
        Update: {
          created_at?: string
          id?: string
          username?: string
          apikey?: string
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
      [_ in never]: never
    }
  }
}
