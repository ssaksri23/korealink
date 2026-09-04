/**
 * Supabase CLI로 자동 생성한 타입 (project qvmplwfmrvsysoxokavu 기준).
 * 재생성: npx supabase gen types typescript --project-id <PROJECT_ID> > src/lib/supabase/database.types.ts
 *
 * Postgres CHECK 제약(예: posts.status)은 리터럴 유니온으로 추론되지 않고 string으로 생성되므로,
 * 아래 유니온 타입들을 앱 코드 전역에서 별도로 사용한다(값 대입/비교 시 이 타입으로 단언).
 */

export type PostCategory =
  | "jobs"
  | "business"
  | "used"
  | "housing"
  | "groupbuy"
  | "events";

export type PostStatus =
  | "draft"
  | "pending_review"
  | "translation_pending"
  | "approved"
  | "published"
  | "expiring"
  | "closed"
  | "hidden"
  | "rejected"
  | "blocked"
  | "deleted";

export type TranslationStatus =
  | "pending"
  | "translating"
  | "translated"
  | "review_required"
  | "reviewed"
  | "failed"
  | "re_review_required";

export type RoleCode =
  | "user"
  | "advertiser"
  | "chatroom_manager"
  | "language_moderator"
  | "admin"
  | "super_admin";


export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: Json | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_details: {
        Row: {
          discount_info: string | null
          industry: string
          map_lat: number | null
          map_lng: number | null
          post_id: string
          services: Json
          updated_at: string
        }
        Insert: {
          discount_info?: string | null
          industry: string
          map_lat?: number | null
          map_lng?: number | null
          post_id: string
          services?: Json
          updated_at?: string
        }
        Update: {
          discount_info?: string | null
          industry?: string
          map_lat?: number | null
          map_lng?: number | null
          post_id?: string
          services?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_details_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name_ko: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name_ko: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name_ko?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_room_managers: {
        Row: {
          chat_room_id: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          chat_room_id: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          chat_room_id?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_managers_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_managers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          invite_link: string | null
          is_active: boolean
          is_verified: boolean
          language_code: string | null
          last_link_checked_at: string | null
          manager_contact: string | null
          name: string
          platform: string
          primary_category_id: string | null
          primary_region_id: string | null
          report_count: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          invite_link?: string | null
          is_active?: boolean
          is_verified?: boolean
          language_code?: string | null
          last_link_checked_at?: string | null
          manager_contact?: string | null
          name: string
          platform: string
          primary_category_id?: string | null
          primary_region_id?: string | null
          report_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          invite_link?: string | null
          is_active?: boolean
          is_verified?: boolean
          language_code?: string | null
          last_link_checked_at?: string | null
          manager_contact?: string | null
          name?: string
          platform?: string
          primary_category_id?: string | null
          primary_region_id?: string | null
          report_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "chat_rooms_primary_category_id_fkey"
            columns: ["primary_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_primary_region_id_fkey"
            columns: ["primary_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          business_hours: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          id: string
          industry: string
          logo_image_url: string | null
          name: string
          owner_id: string
          phone: string | null
          status: string
          supported_languages: string[]
          updated_at: string
          verification_status: string
        }
        Insert: {
          address?: string | null
          business_hours?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          industry: string
          logo_image_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          status?: string
          supported_languages?: string[]
          updated_at?: string
          verification_status?: string
        }
        Update: {
          address?: string | null
          business_hours?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          industry?: string
          logo_image_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          status?: string
          supported_languages?: string[]
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_verifications: {
        Row: {
          business_registration_doc_url: string | null
          company_address: string | null
          company_id: string
          company_phone: string | null
          created_at: string
          created_by: string
          id: string
          job_placement_license_doc_url: string | null
          other_docs: Json
          rejection_reason: string | null
          representative_id_doc_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_registration_doc_url?: string | null
          company_address?: string | null
          company_id: string
          company_phone?: string | null
          created_at?: string
          created_by: string
          id?: string
          job_placement_license_doc_url?: string | null
          other_docs?: Json
          rejection_reason?: string | null
          representative_id_doc_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_registration_doc_url?: string | null
          company_address?: string | null
          company_id?: string
          company_phone?: string | null
          created_at?: string
          created_by?: string
          id?: string
          job_placement_license_doc_url?: string | null
          other_docs?: Json
          rejection_reason?: string | null
          representative_id_doc_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_verifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_verifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_channels: {
        Row: {
          channel_name: string
          created_at: string
          id: string
          is_active: boolean
          language_code: string
          platform: string
          telegram_chat_id: string | null
          updated_at: string
        }
        Insert: {
          channel_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          language_code: string
          platform?: string
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Update: {
          channel_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          language_code?: string
          platform?: string
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribution_channels_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      distribution_logs: {
        Row: {
          channel_id: string
          completed_at: string | null
          error_message: string | null
          id: string
          language_code: string
          post_id: string
          requested_at: string
          requested_by: string | null
          status: string
          telegram_message_id: string | null
        }
        Insert: {
          channel_id: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          language_code: string
          post_id: string
          requested_at?: string
          requested_by?: string | null
          status?: string
          telegram_message_id?: string | null
        }
        Update: {
          channel_id?: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          language_code?: string
          post_id?: string
          requested_at?: string
          requested_by?: string | null
          status?: string
          telegram_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distribution_logs_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "distribution_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_logs_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "distribution_logs_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_logs_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_details: {
        Row: {
          application_method: string | null
          capacity: number | null
          current_participants: number
          event_date: string | null
          event_time: string | null
          event_type: string
          fee: number
          organizer: string | null
          post_id: string
          supported_languages: string[]
          updated_at: string
          venue: string | null
        }
        Insert: {
          application_method?: string | null
          capacity?: number | null
          current_participants?: number
          event_date?: string | null
          event_time?: string | null
          event_type: string
          fee?: number
          organizer?: string | null
          post_id: string
          supported_languages?: string[]
          updated_at?: string
          venue?: string | null
        }
        Update: {
          application_method?: string | null
          capacity?: number | null
          current_participants?: number
          event_date?: string | null
          event_time?: string | null
          event_type?: string
          fee?: number
          organizer?: string | null
          post_id?: string
          supported_languages?: string[]
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_details_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_buy_details: {
        Row: {
          current_count: number
          deadline: string | null
          pickup_method: string | null
          pickup_region_id: string | null
          post_id: string
          price: number
          target_count: number
          updated_at: string
        }
        Insert: {
          current_count?: number
          deadline?: string | null
          pickup_method?: string | null
          pickup_region_id?: string | null
          post_id: string
          price: number
          target_count: number
          updated_at?: string
        }
        Update: {
          current_count?: number
          deadline?: string | null
          pickup_method?: string | null
          pickup_region_id?: string | null
          post_id?: string
          price?: number
          target_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_buy_details_pickup_region_id_fkey"
            columns: ["pickup_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_buy_details_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      housing_details: {
        Row: {
          amenities: string[]
          capacity: number | null
          contract_period: string | null
          deposit: number | null
          gender_condition: string | null
          maintenance_fee: number | null
          monthly_rent: number | null
          move_in_date: string | null
          post_id: string
          property_type: string
          transit_info: string | null
          updated_at: string
        }
        Insert: {
          amenities?: string[]
          capacity?: number | null
          contract_period?: string | null
          deposit?: number | null
          gender_condition?: string | null
          maintenance_fee?: number | null
          monthly_rent?: number | null
          move_in_date?: string | null
          post_id: string
          property_type: string
          transit_info?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: string[]
          capacity?: number | null
          contract_period?: string | null
          deposit?: number | null
          gender_condition?: string | null
          maintenance_fee?: number | null
          monthly_rent?: number | null
          move_in_date?: string | null
          post_id?: string
          property_type?: string
          transit_info?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housing_details_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          contact_phone: string | null
          created_at: string
          id: string
          message: string
          post_id: string
          profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string
          id?: string
          message: string
          post_id: string
          profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          contact_phone?: string | null
          created_at?: string
          id?: string
          message?: string
          post_id?: string
          profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_details: {
        Row: {
          break_time: string | null
          commute_bus_provided: boolean
          commute_bus_stops: string | null
          foreigner_allowed: boolean
          housing_cost: string | null
          housing_provided: boolean
          industrial_complex_name: string | null
          industry: string
          korean_level: string | null
          meal_provided: boolean
          overtime_available: boolean
          pay_cycle: string | null
          pay_day: string | null
          pay_next_day: boolean
          pay_same_day: boolean
          post_id: string
          preparation_items: string | null
          recruit_count: number | null
          recruit_target: string | null
          shift_type: string | null
          special_work_available: boolean
          updated_at: string
          visa_types: string[]
          wage_max: number | null
          wage_min: number | null
          wage_type: string | null
          work_hours: string | null
          work_period: string | null
        }
        Insert: {
          break_time?: string | null
          commute_bus_provided?: boolean
          commute_bus_stops?: string | null
          foreigner_allowed?: boolean
          housing_cost?: string | null
          housing_provided?: boolean
          industrial_complex_name?: string | null
          industry: string
          korean_level?: string | null
          meal_provided?: boolean
          overtime_available?: boolean
          pay_cycle?: string | null
          pay_day?: string | null
          pay_next_day?: boolean
          pay_same_day?: boolean
          post_id: string
          preparation_items?: string | null
          recruit_count?: number | null
          recruit_target?: string | null
          shift_type?: string | null
          special_work_available?: boolean
          updated_at?: string
          visa_types?: string[]
          wage_max?: number | null
          wage_min?: number | null
          wage_type?: string | null
          work_hours?: string | null
          work_period?: string | null
        }
        Update: {
          break_time?: string | null
          commute_bus_provided?: boolean
          commute_bus_stops?: string | null
          foreigner_allowed?: boolean
          housing_cost?: string | null
          housing_provided?: boolean
          industrial_complex_name?: string | null
          industry?: string
          korean_level?: string | null
          meal_provided?: boolean
          overtime_available?: boolean
          pay_cycle?: string | null
          pay_day?: string | null
          pay_next_day?: boolean
          pay_same_day?: boolean
          post_id?: string
          preparation_items?: string | null
          recruit_count?: number | null
          recruit_target?: string | null
          shift_type?: string | null
          special_work_available?: boolean
          updated_at?: string
          visa_types?: string[]
          wage_max?: number | null
          wage_min?: number | null
          wage_type?: string | null
          work_hours?: string | null
          work_period?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_details_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string
          display_order: number
          flag_emoji: string
          is_active: boolean
          name_korean: string
          name_native: string
          telegram_channel_id: string | null
          translation_enabled: boolean
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          flag_emoji: string
          is_active?: boolean
          name_korean: string
          name_native: string
          telegram_channel_id?: string | null
          translation_enabled?: boolean
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          flag_emoji?: string
          is_active?: boolean
          name_korean?: string
          name_native?: string
          telegram_channel_id?: string | null
          translation_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          profile_id: string
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          profile_id: string
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          profile_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          chat_room_id: string | null
          company_id: string | null
          created_at: string
          ends_at: string | null
          id: string
          post_id: string | null
          product_id: string
          profile_id: string
          quantity: number
          starts_at: string | null
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          chat_room_id?: string | null
          company_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          post_id?: string | null
          product_id: string
          profile_id: string
          quantity?: number
          starts_at?: string | null
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          chat_room_id?: string | null
          company_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          post_id?: string | null
          product_id?: string
          profile_id?: string
          quantity?: number
          starts_at?: string | null
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          depositor_name: string | null
          external_transaction_id: string | null
          id: string
          memo: string | null
          method: string
          order_id: string
          provider: string
          refund_reason: string | null
          refund_requested_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          depositor_name?: string | null
          external_transaction_id?: string | null
          id?: string
          memo?: string | null
          method?: string
          order_id: string
          provider?: string
          refund_reason?: string | null
          refund_requested_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          depositor_name?: string | null
          external_transaction_id?: string | null
          id?: string
          memo?: string | null
          method?: string
          order_id?: string
          provider?: string
          refund_reason?: string | null
          refund_requested_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      post_chat_room_sources: {
        Row: {
          chat_room_id: string
          created_at: string
          id: string
          post_id: string
          posted_at: string | null
          posted_by: string | null
        }
        Insert: {
          chat_room_id: string
          created_at?: string
          id?: string
          post_id: string
          posted_at?: string | null
          posted_by?: string | null
        }
        Update: {
          chat_room_id?: string
          created_at?: string
          id?: string
          post_id?: string
          posted_at?: string | null
          posted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_chat_room_sources_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_chat_room_sources_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_chat_room_sources_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_primary: boolean
          post_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean
          post_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean
          post_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          post_id: string
          reason: string | null
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          post_id: string
          reason?: string | null
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          post_id?: string
          reason?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_status_history_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_translations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          language_code: string
          post_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          translated_content: string | null
          translated_title: string | null
          translation_source: string | null
          translation_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          language_code: string
          post_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          translated_content?: string | null
          translated_title?: string | null
          translation_source?: string | null
          translation_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          language_code?: string
          post_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          translated_content?: string | null
          translated_title?: string | null
          translation_source?: string | null
          translation_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_translations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "post_translations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_translations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          category_id: string
          company_id: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          expires_at: string | null
          id: string
          is_featured: boolean
          is_pinned: boolean
          is_urgent: boolean
          original_language_code: string
          published_at: string | null
          region_id: string | null
          rejection_reason: string | null
          share_code: string
          status: string
          updated_at: string
          view_count: number
        }
        Insert: {
          category_id: string
          company_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          is_featured?: boolean
          is_pinned?: boolean
          is_urgent?: boolean
          original_language_code?: string
          published_at?: string | null
          region_id?: string | null
          rejection_reason?: string | null
          share_code?: string
          status?: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          category_id?: string
          company_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          is_featured?: boolean
          is_pinned?: boolean
          is_urgent?: boolean
          original_language_code?: string
          published_at?: string | null
          region_id?: string | null
          rejection_reason?: string | null
          share_code?: string
          status?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_original_language_code_fkey"
            columns: ["original_language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "posts_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          code: string
          created_at: string
          description: string | null
          duration_days: number | null
          id: string
          is_active: boolean
          name_ko: string
          price: number
          sort_order: number
          unit: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          name_ko: string
          price: number
          sort_order?: number
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          name_ko?: string
          price?: number
          sort_order?: number
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          display_name: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          display_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          display_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_preferred_language"
            columns: ["preferred_language"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      prohibited_words: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          language_code: string
          severity: string
          word: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          language_code: string
          severity?: string
          word: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          language_code?: string
          severity?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "prohibited_words_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prohibited_words_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      recent_views: {
        Row: {
          id: string
          post_id: string
          profile_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          post_id: string
          profile_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          profile_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recent_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recent_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string
          eupmyeondong: string | null
          id: string
          sido: string
          sigungu: string | null
        }
        Insert: {
          created_at?: string
          eupmyeondong?: string | null
          id?: string
          sido: string
          sigungu?: string | null
        }
        Update: {
          created_at?: string
          eupmyeondong?: string | null
          id?: string
          sido?: string
          sigungu?: string | null
        }
        Relationships: []
      }
      report_actions: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          memo: string | null
          report_id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          memo?: string | null
          report_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          memo?: string | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_actions_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_actions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          chat_room_id: string | null
          company_id: string | null
          created_at: string
          detail: string | null
          id: string
          post_id: string | null
          report_type: string
          reporter_id: string
          status: string
        }
        Insert: {
          chat_room_id?: string | null
          company_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          post_id?: string | null
          report_type: string
          reporter_id: string
          status?: string
        }
        Update: {
          chat_room_id?: string | null
          company_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          post_id?: string | null
          report_type?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string
          description: string | null
          name_ko: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          name_ko: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          name_ko?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      used_item_details: {
        Row: {
          category: string
          item_condition: string | null
          post_id: string
          price: number
          sale_status: string
          updated_at: string
        }
        Insert: {
          category: string
          item_condition?: string | null
          post_id: string
          price: number
          sale_status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          item_condition?: string | null
          post_id?: string
          price?: number
          sale_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "used_item_details_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          role_code: string
          scope_language_code: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          role_code: string
          scope_language_code?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          role_code?: string
          scope_language_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_prohibited_content: {
        Args: { content: string }
        Returns: {
          severity: string
          word: string
        }[]
      }
      generate_share_code: { Args: never; Returns: string }
      has_role: {
        Args: { target_profile?: string; target_role: string }
        Returns: boolean
      }
      increment_post_view: { Args: { target_post: string }; Returns: undefined }
      is_admin: { Args: { target_profile?: string }; Returns: boolean }
      is_language_moderator: {
        Args: { target_language: string; target_profile?: string }
        Returns: boolean
      }
      is_super_admin: { Args: { target_profile?: string }; Returns: boolean }
      manages_chat_room: {
        Args: { target_chat_room: string; target_profile?: string }
        Returns: boolean
      }
      owns_post: {
        Args: { target_post: string; target_profile?: string }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
