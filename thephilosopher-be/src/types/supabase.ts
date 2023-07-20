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
      goals: {
        Row: {
          created_at: string | null
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          content: string
          created_at: string | null
          embedding: string
          goal_id: string | null
          id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding: string
          goal_id?: string | null
          id?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string
          goal_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_goal_id_fkey"
            columns: ["goal_id"]
            referencedRelation: "goals"
            referencedColumns: ["id"]
          }
        ]
      }
      prompts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id: string
          name: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      text_resource_segments: {
        Row: {
          content: string
          created_at: string
          embedding: string
          id: string
          index: number
          text_resource_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding: string
          id?: string
          index: number
          text_resource_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string
          id?: string
          index?: number
          text_resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "text_resource_segments_text_resource_id_fkey"
            columns: ["text_resource_id"]
            referencedRelation: "text_resources"
            referencedColumns: ["id"]
          }
        ]
      }
      text_resources: {
        Row: {
          author_names: string | null
          created_at: string
          description: string | null
          gutendex_id: number | null
          id: string
          title: string
        }
        Insert: {
          author_names?: string | null
          created_at?: string
          description?: string | null
          gutendex_id?: number | null
          id?: string
          title: string
        }
        Update: {
          author_names?: string | null
          created_at?: string
          description?: string | null
          gutendex_id?: number | null
          id?: string
          title?: string
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
