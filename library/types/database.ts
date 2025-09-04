// TypeScript definitions for Library Management System Database Schema
// Generated based on the database migration schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          book_id: number
          isbn: string
          title: string
          author: string
          publisher: string
          publication_year: number
          category: string
          total_copies: number
          available_copies: number
          created_at: string
          updated_at: string
        }
        Insert: {
          book_id?: number
          isbn: string
          title: string
          author: string
          publisher: string
          publication_year: number
          category: string
          total_copies?: number
          available_copies?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          book_id?: number
          isbn?: string
          title?: string
          author?: string
          publisher?: string
          publication_year?: number
          category?: string
          total_copies?: number
          available_copies?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      penalties: {
        Row: {
          penalty_id: number
          user_id: string
          reservation_id: number | null
          amount: number
          reason: string
          status: Database["public"]["Enums"]["penalty_status"]
          created_at: string
        }
        Insert: {
          penalty_id?: number
          user_id: string
          reservation_id?: number | null
          amount: number
          reason: string
          status?: Database["public"]["Enums"]["penalty_status"]
          created_at?: string
        }
        Update: {
          penalty_id?: number
          user_id?: string
          reservation_id?: number | null
          amount?: number
          reason?: string
          status?: Database["public"]["Enums"]["penalty_status"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "penalties_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["reservation_id"]
          },
          {
            foreignKeyName: "penalties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
      }
      reservations: {
        Row: {
          reservation_id: number
          user_id: string
          book_id: number
          reservation_date: string
          due_date: string
          return_date: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          reminder_sent: boolean
          created_at: string
        }
        Insert: {
          reservation_id?: number
          user_id: string
          book_id: number
          reservation_date?: string
          due_date: string
          return_date?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          reminder_sent?: boolean
          created_at?: string
        }
        Update: {
          reservation_id?: number
          user_id?: string
          book_id?: number
          reservation_date?: string
          due_date?: string
          return_date?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          reminder_sent?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
      }
      users: {
        Row: {
          user_id: string
          first_name: string
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
          created_at: string
          is_active: boolean
          penalty_count: number
        }
        Insert: {
          user_id: string
          first_name: string
          last_name: string
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          is_active?: boolean
          penalty_count?: number
        }
        Update: {
          user_id?: string
          first_name?: string
          last_name?: string
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          is_active?: boolean
          penalty_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_sample_penalties: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_sample_reservations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_sample_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_book_availability: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_books_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_penalty_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      penalty_status: "pending" | "paid" | "waived"
      reservation_status: "active" | "returned" | "overdue" | "cancelled"
      user_role: "customer" | "librarian"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// Convenience type exports
export type Book = Tables<'books'>
export type BookInsert = TablesInsert<'books'>
export type BookUpdate = TablesUpdate<'books'>

export type User = Tables<'users'>
export type UserInsert = TablesInsert<'users'>
export type UserUpdate = TablesUpdate<'users'>

export type Reservation = Tables<'reservations'>
export type ReservationInsert = TablesInsert<'reservations'>
export type ReservationUpdate = TablesUpdate<'reservations'>

export type Penalty = Tables<'penalties'>
export type PenaltyInsert = TablesInsert<'penalties'>
export type PenaltyUpdate = TablesUpdate<'penalties'>

export type UserRole = Enums<'user_role'>
export type ReservationStatus = Enums<'reservation_status'>
export type PenaltyStatus = Enums<'penalty_status'>