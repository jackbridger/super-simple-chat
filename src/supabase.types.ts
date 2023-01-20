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
          owner_user_id: string | null
        }
        Insert: {
          created_at: string
          id?: string
          name: string
          owner_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string | null
        }
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string | null
        }
        Insert: {
          created_at: string
          id?: string
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string | null
        }
      }
      user_conversation: {
        Row: {
          conversation_id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          user_id?: string
        }
      }
      users: {
        Row: {
          created_at: string
          id: string
          username: string
        }
        Insert: {
          created_at: string
          id?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          username?: string
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