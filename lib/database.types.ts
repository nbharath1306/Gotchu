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
            items: {
                Row: {
                    id: string
                    user_id: string
                    type: "LOST" | "FOUND"
                    title: string
                    description: string | null
                    category: string
                    location_zone: string
                    date: string
                    contact: string
                    image_url: string | null
                    creator_id: string | null
                    last_message_at: string | null
                    status: "OPEN" | "RESOLVED"
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: "LOST" | "FOUND"
                    title: string
                    description?: string | null
                    category: string
                    location_zone: string
                    date: string
                    contact: string
                    image_url?: string | null
                    creator_id?: string | null
                    last_message_at?: string | null
                    status?: "OPEN" | "RESOLVED"
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: "LOST" | "FOUND"
                    title?: string
                    description?: string | null
                    category?: string
                    location_zone?: string
                    date?: string
                    contact?: string
                    image_url?: string | null
                    creator_id?: string | null
                    last_message_at?: string | null
                    status?: "OPEN" | "RESOLVED"
                    created_at?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "items_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            users: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    karma_points: number
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    karma_points?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    karma_points?: number
                    created_at?: string
                }
                Relationships: []
            }
            chats: {
                Row: {
                    id: string
                    item_id: string
                    related_item_id: string | null
                    user_a: string
                    user_b: string
                    status: "OPEN" | "PENDING_CLOSURE" | "CLOSED"
                    closure_requested_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    item_id: string
                    related_item_id?: string | null
                    user_a: string
                    user_b: string
                    status?: "OPEN" | "PENDING_CLOSURE" | "CLOSED"
                    closure_requested_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    item_id?: string
                    related_item_id?: string | null
                    user_a?: string
                    user_b?: string
                    status?: "OPEN" | "PENDING_CLOSURE" | "CLOSED"
                    closure_requested_by?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "chats_item_id_fkey"
                        columns: ["item_id"]
                        isOneToOne: false
                        referencedRelation: "items"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "chats_related_item_id_fkey"
                        columns: ["related_item_id"]
                        isOneToOne: false
                        referencedRelation: "items"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "chats_user_a_fkey"
                        columns: ["user_a"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "chats_user_b_fkey"
                        columns: ["user_b"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            messages: {
                Row: {
                    id: string
                    chat_id: string
                    sender_id: string
                    content: string | null
                    message_type: "TEXT" | "IMAGE" | "FILE"
                    media_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    chat_id: string
                    sender_id: string
                    content?: string | null
                    message_type?: "TEXT" | "IMAGE" | "FILE"
                    media_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    chat_id?: string
                    sender_id?: string
                    content?: string | null
                    message_type?: "TEXT" | "IMAGE" | "FILE"
                    media_url?: string | null
                    created_at?: string
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
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
