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
      embeddings: {
        Row: {
          content: string
          content_length: number
          created_at: string
          embedding: string
          id: string
          metadata: Json | null
        }
        Insert: {
          content: string
          content_length?: number
          created_at?: string
          embedding: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          content?: string
          content_length?: number
          created_at?: string
          embedding?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      goal_settings: {
        Row: {
          created_at: string | null
          goal_id: string
          id: string
          settings_base: Json
          settings_dynamic: Json
        }
        Insert: {
          created_at?: string | null
          goal_id: string
          id?: string
          settings_base: Json
          settings_dynamic: Json
        }
        Update: {
          created_at?: string | null
          goal_id?: string
          id?: string
          settings_base?: Json
          settings_dynamic?: Json
        }
        Relationships: [
          {
            foreignKeyName: "goal_settings_goal_id_fkey"
            columns: ["goal_id"]
            referencedRelation: "goals"
            referencedColumns: ["id"]
          }
        ]
      }
      goals: {
        Row: {
          craft_insight_temperature: number
          created_at: string | null
          description: string
          id: string
          meditative_process_temperature: number
          name: string
          organize_ideas_match_count: number
          organize_ideas_resource_similarity: number
          organize_ideas_temperature: number
        }
        Insert: {
          craft_insight_temperature?: number
          created_at?: string | null
          description: string
          id?: string
          meditative_process_temperature?: number
          name: string
          organize_ideas_match_count?: number
          organize_ideas_resource_similarity?: number
          organize_ideas_temperature?: number
        }
        Update: {
          craft_insight_temperature?: number
          created_at?: string | null
          description?: string
          id?: string
          meditative_process_temperature?: number
          name?: string
          organize_ideas_match_count?: number
          organize_ideas_resource_similarity?: number
          organize_ideas_temperature?: number
        }
        Relationships: []
      }
      insight_embeddings: {
        Row: {
          embedding_id: string
          insight_id: string
        }
        Insert: {
          embedding_id: string
          insight_id: string
        }
        Update: {
          embedding_id?: string
          insight_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insight_embeddings_embedding_id_fkey"
            columns: ["embedding_id"]
            referencedRelation: "embeddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insight_embeddings_insight_id_fkey"
            columns: ["insight_id"]
            referencedRelation: "insights"
            referencedColumns: ["id"]
          }
        ]
      }
      insight_text_resources: {
        Row: {
          insight_id: string
          text_resource_id: string
        }
        Insert: {
          insight_id: string
          text_resource_id: string
        }
        Update: {
          insight_id?: string
          text_resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insight_text_resources_insight_id_fkey"
            columns: ["insight_id"]
            referencedRelation: "insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insight_text_resources_text_resource_id_fkey"
            columns: ["text_resource_id"]
            referencedRelation: "text_resources"
            referencedColumns: ["id"]
          }
        ]
      }
      insights: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
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
      text_resource_segment_embeddings: {
        Row: {
          embedding_id: string
          text_resource_segment_id: string
        }
        Insert: {
          embedding_id: string
          text_resource_segment_id: string
        }
        Update: {
          embedding_id?: string
          text_resource_segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "text_resource_segment_embeddings_embedding_id_fkey"
            columns: ["embedding_id"]
            referencedRelation: "embeddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "text_resource_segment_embeddings_text_resource_segment_id_fkey"
            columns: ["text_resource_segment_id"]
            referencedRelation: "text_resource_segments"
            referencedColumns: ["id"]
          }
        ]
      }
      text_resource_segments: {
        Row: {
          created_at: string
          id: string
          index: number
          text_resource_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          index: number
          text_resource_id: string
        }
        Update: {
          created_at?: string
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
          url: string | null
        }
        Insert: {
          author_names?: string | null
          created_at?: string
          description?: string | null
          gutendex_id?: number | null
          id?: string
          title: string
          url?: string | null
        }
        Update: {
          author_names?: string | null
          created_at?: string
          description?: string | null
          gutendex_id?: number | null
          id?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_embeddings_by_text_resource_id: {
        Args: {
          p_text_resource_id: string
        }
        Returns: undefined
      }
      match_insight_embeddings: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          insight_id: string
          embedding_id: string
          content: string
          similarity: number
        }[]
      }
      match_text_resource_segments: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          content: string
          similarity: number
        }[]
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
