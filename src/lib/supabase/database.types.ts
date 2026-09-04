/**
 * 수기로 작성한 최소 타입 정의.
 * 실제 Supabase 프로젝트 연결 후에는 다음 명령으로 자동 생성된 타입으로 교체할 것:
 *   npx supabase gen types typescript --project-id <PROJECT_ID> > src/lib/supabase/database.types.ts
 * 이 파일은 그 전까지 타입 안정성을 위한 임시 정의이며, supabase/migrations/*.sql 과 동기화되어야 한다.
 * (Relationships: [] 는 실제 FK 관계 대신 넣어둔 자리표시자로, 자동 생성 타입으로 교체되면
 *  nested select(post_translations(...) 등)의 타입 추론이 더 정확해진다.)
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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          preferred_language: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
          status: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      roles: {
        Row: { code: RoleCode; name_ko: string; description: string | null };
        Insert: Database["public"]["Tables"]["roles"]["Row"];
        Update: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          profile_id: string;
          role_code: RoleCode;
          scope_language_code: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_roles"]["Row"]> & {
          profile_id: string;
          role_code: RoleCode;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Row"]>;
        Relationships: [];
      };
      languages: {
        Row: {
          code: string;
          name_native: string;
          name_korean: string;
          flag_emoji: string;
          is_active: boolean;
          display_order: number;
          translation_enabled: boolean;
          telegram_channel_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["languages"]["Row"]> & {
          code: string;
        };
        Update: Partial<Database["public"]["Tables"]["languages"]["Row"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: PostCategory;
          name_ko: string;
          icon: string | null;
          display_order: number;
          is_active: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          slug: PostCategory;
          name_ko: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      regions: {
        Row: {
          id: string;
          sido: string;
          sigungu: string | null;
          eupmyeondong: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["regions"]["Row"]> & {
          sido: string;
        };
        Update: Partial<Database["public"]["Tables"]["regions"]["Row"]>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          category_id: string;
          company_id: string | null;
          created_by: string;
          status: PostStatus;
          original_language_code: string;
          region_id: string | null;
          share_code: string;
          view_count: number;
          is_urgent: boolean;
          is_featured: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["posts"]["Row"]> & {
          category_id: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Row"]>;
        Relationships: [];
      };
      post_translations: {
        Row: {
          id: string;
          post_id: string;
          language_code: string;
          translated_title: string | null;
          translated_content: string | null;
          translation_status: TranslationStatus;
          translation_source: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["post_translations"]["Row"]
        > & { post_id: string; language_code: string };
        Update: Partial<
          Database["public"]["Tables"]["post_translations"]["Row"]
        >;
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          profile_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: { profile_id: string; post_id: string };
        Update: Partial<Database["public"]["Tables"]["bookmarks"]["Row"]>;
        Relationships: [];
      };
      recent_views: {
        Row: {
          id: string;
          profile_id: string;
          post_id: string;
          viewed_at: string;
        };
        Insert: { profile_id: string; post_id: string };
        Update: Partial<Database["public"]["Tables"]["recent_views"]["Row"]>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          post_id: string;
          profile_id: string;
          message: string;
          contact_phone: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          post_id: string;
          profile_id: string;
          message: string;
          contact_phone?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Row"]>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          post_id: string | null;
          chat_room_id: string | null;
          company_id: string | null;
          reporter_id: string;
          report_type: string;
          detail: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          post_id?: string | null;
          chat_room_id?: string | null;
          company_id?: string | null;
          reporter_id: string;
          report_type: string;
          detail?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_post_view: {
        Args: { target_post: string };
        Returns: undefined;
      };
    };
  };
}
