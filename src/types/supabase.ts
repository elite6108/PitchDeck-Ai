export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      logos: {
        Row: {
          id: string
          user_id: string
          company_name: string
          image_url: string
          prompt: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          image_url: string
          prompt: string
          settings: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          image_url?: string
          prompt?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "logos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pitch_decks: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pitch_decks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      slides: {
        Row: {
          id: string
          pitch_deck_id: string
          title: string
          content: Json
          position: number
          slide_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pitch_deck_id: string
          title: string
          content: Json
          position: number
          slide_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pitch_deck_id?: string
          title?: string
          content?: Json
          position?: number
          slide_type?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "slides_pitch_deck_id_fkey"
            columns: ["pitch_deck_id"]
            referencedRelation: "pitch_decks"
            referencedColumns: ["id"]
          }
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