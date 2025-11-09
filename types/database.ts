export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    extensions?: Json
                    operationName?: string
                    query?: string
                    variables?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    public: {
        Tables: {
            books: {
                Row: {
                    author: string
                    available_copies: number
                    book_id: number
                    category: string
                    created_at: string
                    image: string | null
                    isbn: string
                    publication_year: number
                    publisher: string
                    title: string
                    total_copies: number
                    updated_at: string
                }
                Insert: {
                    author: string
                    available_copies?: number
                    book_id?: number
                    category: string
                    created_at?: string
                    image?: string | null
                    isbn: string
                    publication_year: number
                    publisher: string
                    title: string
                    total_copies?: number
                    updated_at?: string
                }
                Update: {
                    author?: string
                    available_copies?: number
                    book_id?: number
                    category?: string
                    created_at?: string
                    image?: string | null
                    isbn?: string
                    publication_year?: number
                    publisher?: string
                    title?: string
                    total_copies?: number
                    updated_at?: string
                }
                Relationships: []
            }
            penalties: {
                Row: {
                    amount: number
                    created_at: string
                    penalty_id: number
                    reason: string
                    reservation_id: number | null
                    status: Database["public"]["Enums"]["penalty_status"]
                    user_id: string
                }
                Insert: {
                    amount: number
                    created_at?: string
                    penalty_id?: number
                    reason: string
                    reservation_id?: number | null
                    status?: Database["public"]["Enums"]["penalty_status"]
                    user_id: string
                }
                Update: {
                    amount?: number
                    created_at?: string
                    penalty_id?: number
                    reason?: string
                    reservation_id?: number | null
                    status?: Database["public"]["Enums"]["penalty_status"]
                    user_id?: string
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
                    },
                ]
            }
            reservations: {
                Row: {
                    book_id: number
                    created_at: string
                    due_date: string
                    extended: boolean
                    reminder_sent: boolean
                    reservation_date: string
                    reservation_id: number
                    return_date: string | null
                    status: Database["public"]["Enums"]["reservation_status"]
                    user_id: string
                }
                Insert: {
                    book_id: number
                    created_at?: string
                    due_date: string
                    extended?: boolean
                    reminder_sent?: boolean
                    reservation_date?: string
                    reservation_id?: number
                    return_date?: string | null
                    status?: Database["public"]["Enums"]["reservation_status"]
                    user_id?: string
                }
                Update: {
                    book_id?: number
                    created_at?: string
                    due_date?: string
                    extended?: boolean
                    reminder_sent?: boolean
                    reservation_date?: string
                    reservation_id?: number
                    return_date?: string | null
                    status?: Database["public"]["Enums"]["reservation_status"]
                    user_id?: string
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
                    },
                ]
            }
            users: {
                Row: {
                    created_at: string
                    email: string
                    first_name: string
                    is_active: boolean
                    last_name: string
                    penalty_count: number
                    role: Database["public"]["Enums"]["user_role"]
                    user_id: string,
                    language?: string
                }
                Insert: {
                    created_at?: string
                    email: string
                    first_name: string
                    is_active?: boolean
                    last_name: string
                    penalty_count?: number
                    role?: Database["public"]["Enums"]["user_role"]
                    user_id: string,
                    language?: string
                }
                Update: {
                    created_at?: string
                    email?: string
                    first_name?: string
                    is_active?: boolean
                    last_name?: string
                    penalty_count?: number
                    role?: Database["public"]["Enums"]["user_role"]
                    user_id?: string,
                    language?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            calculate_penalty_amount: {
                Args: { overdue_days: number }
                Returns: number
            }
            can_user_reserve_books: {
                Args: { user_uuid?: string }
                Returns: {
                    can_reserve: boolean
                    overdue_book_count: number
                    restriction_reason: string
                }[]
            }
            create_overdue_penalty: {
                Args: { reservation_uuid: number }
                Returns: undefined
            }
            create_user_profile_manually: {
                Args: {
                    p_email: string
                    p_first_name?: string
                    p_last_name?: string
                    p_role?: Database["public"]["Enums"]["user_role"]
                    p_user_id: string
                }
                Returns: boolean
            }
            debug_health: {
                Args: Record<PropertyKey, never>
                Returns: {
                    allow_user_profile_creation_policy: boolean
                    auth_users_role_udt: string
                    handle_new_user_exists: boolean
                    on_auth_user_created_trigger: boolean
                    penalty_status_exists: boolean
                    public_users_role_udt: string
                    reservation_status_exists: boolean
                    user_role_type_exists: boolean
                }[]
            }
            get_all_overdue_books: {
                Args: Record<PropertyKey, never>
                Returns: {
                    book_author: string
                    book_title: string
                    days_overdue: number
                    due_date: string
                    reservation_id: number
                    user_email: string
                    user_id: string
                    user_name: string
                }[]
            }
            get_penalty_config: {
                Args: { config_key: string }
                Returns: number
            }
            get_user_penalties: {
                Args: { user_uuid?: string }
                Returns: {
                    amount: number
                    book_author: string
                    book_title: string
                    created_at: string
                    due_date: string
                    penalty_id: number
                    reason: string
                    reservation_id: number
                    return_date: string
                    status: Database["public"]["Enums"]["penalty_status"]
                }[]
            }
            get_user_profile: {
                Args: { user_uuid?: string }
                Returns: {
                    created_at: string
                    email: string
                    first_name: string
                    is_active: boolean
                    last_name: string
                    penalty_count: number
                    role: Database["public"]["Enums"]["user_role"]
                    user_id: string
                }[]
            }
            mark_book_returned: {
                Args: { reservation_uuid: number }
                Returns: boolean
            }
            process_overdue_books: {
                Args: Record<PropertyKey, never>
                Returns: number
            }
            resolve_overdue_on_return: {
                Args: { reservation_uuid: number }
                Returns: undefined
            }
            user_has_pending_penalties: {
                Args: { user_uuid: string }
                Returns: boolean
            }
            get_user_borrowed: {
                Args: { user_uuid?: string }
                Returns: {
                    reservation_id: number
                    created_at: string
                    book_title: string | null
                    book_author: string | null
                    due_date: string | null
                    return_date: string | null
                }[]
            }
            get_all_borrowed_books: {
                Args: Record<PropertyKey, never>; // no arguments
                Returns: {
                    reservation_id: number;
                    user_name: string;
                    user_email: string;
                    book_title: string;
                    book_author: string;
                    due_date: string;
                    extended: boolean;
                    status: Database["public"]["Enums"]["reservation_status"];
                    user_id: string;
                }[];
            };
        }
        Enums: {
            penalty_status: "pending" | "paid" | "waived"
            reservation_status: "active" | 'extended' | "returned" | "overdue" | "cancelled"
            user_role: "customer" | "librarian"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
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
    DefaultSchemaTableNameOrOptions extends | keyof DefaultSchema["Tables"]
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
    DefaultSchemaTableNameOrOptions extends | keyof DefaultSchema["Tables"]
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
    DefaultSchemaEnumNameOrOptions extends | keyof DefaultSchema["Enums"]
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
    PublicCompositeTypeNameOrOptions extends | keyof DefaultSchema["CompositeTypes"]
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
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {
            penalty_status: ["pending", "paid", "waived"],
            reservation_status: ["active", "returned", "overdue", "cancelled"],
            user_role: ["customer", "librarian"],
        },
    },
} as const

