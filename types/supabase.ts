export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saves: {
        Row: {
          id: string;
          user_id: string;
          type: "link" | "pdf" | "image" | "note";
          title: string | null;
          description: string | null;
          source_url: string | null;
          content_text: string | null;
          file_path: string | null;
          mime_type: string | null;
          metadata: Json;
          content_word_count: number | null;
          content_extracted_at: string | null;
          content_status: "pending" | "success" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "link" | "pdf" | "image" | "note";
          title?: string | null;
          description?: string | null;
          source_url?: string | null;
          content_text?: string | null;
          file_path?: string | null;
          mime_type?: string | null;
          metadata?: Json;
          content_word_count?: number | null;
          content_extracted_at?: string | null;
          content_status?: "pending" | "success" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "link" | "pdf" | "image" | "note";
          title?: string | null;
          description?: string | null;
          source_url?: string | null;
          content_text?: string | null;
          file_path?: string | null;
          mime_type?: string | null;
          metadata?: Json;
          content_word_count?: number | null;
          content_extracted_at?: string | null;
          content_status?: "pending" | "success" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string | null;
          emoji: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string | null;
          emoji?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          emoji?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      save_collections: {
        Row: {
          id: string;
          user_id: string;
          save_id: string;
          collection_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          save_id: string;
          collection_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          save_id?: string;
          collection_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          timezone: string;
          locale: string;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timezone?: string;
          locale?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timezone?: string;
          locale?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
