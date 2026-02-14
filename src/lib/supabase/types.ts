// ==============================================
// AIVO Dossier - TypeScript Types
// ==============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Database schema types
export interface Database {
  public: {
    Tables: {
      ds_tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          brand_colors: Json;
          settings: Json;
          plan: string;
          max_datasheets_month: number;
          max_users: number;
          max_templates: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          brand_colors?: Json;
          settings?: Json;
          plan?: string;
          max_datasheets_month?: number;
          max_users?: number;
          max_templates?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          brand_colors?: Json;
          settings?: Json;
          plan?: string;
          max_datasheets_month?: number;
          max_users?: number;
          max_templates?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ds_tenant_users: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: "admin" | "editor" | "reviewer";
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          role?: "admin" | "editor" | "reviewer";
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          role?: "admin" | "editor" | "reviewer";
          created_at?: string;
        };
      };
      ds_data_schemas: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          fields: Json;
          description_prompt: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          fields?: Json;
          description_prompt?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          fields?: Json;
          description_prompt?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ds_templates: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          template_type: "single" | "catalog_cover" | "catalog_page";
          layout: Json;
          brand_config: Json;
          thumbnail_url: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          template_type?: "single" | "catalog_cover" | "catalog_page";
          layout?: Json;
          brand_config?: Json;
          thumbnail_url?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          template_type?: "single" | "catalog_cover" | "catalog_page";
          layout?: Json;
          brand_config?: Json;
          thumbnail_url?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ds_datasheets: {
        Row: {
          id: string;
          tenant_id: string;
          schema_id: string | null;
          template_id: string | null;
          project_code: string | null;
          article_name: string | null;
          material: string | null;
          finish: string | null;
          dimensions: string | null;
          weight: string | null;
          technical_specs: Json;
          components: Json;
          generated_description: string | null;
          description_language: string;
          generation_metadata: Json;
          status: DatasheetStatus;
          error_message: string | null;
          source_file_url: string | null;
          source_file_name: string | null;
          exported_pdf_url: string | null;
          created_by: string | null;
          approved_by: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          schema_id?: string | null;
          template_id?: string | null;
          project_code?: string | null;
          article_name?: string | null;
          material?: string | null;
          finish?: string | null;
          dimensions?: string | null;
          weight?: string | null;
          technical_specs?: Json;
          components?: Json;
          generated_description?: string | null;
          description_language?: string;
          generation_metadata?: Json;
          status?: DatasheetStatus;
          error_message?: string | null;
          source_file_url?: string | null;
          source_file_name?: string | null;
          exported_pdf_url?: string | null;
          created_by?: string | null;
          approved_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          schema_id?: string | null;
          template_id?: string | null;
          project_code?: string | null;
          article_name?: string | null;
          material?: string | null;
          finish?: string | null;
          dimensions?: string | null;
          weight?: string | null;
          technical_specs?: Json;
          components?: Json;
          generated_description?: string | null;
          description_language?: string;
          generation_metadata?: Json;
          status?: DatasheetStatus;
          error_message?: string | null;
          source_file_url?: string | null;
          source_file_name?: string | null;
          exported_pdf_url?: string | null;
          created_by?: string | null;
          approved_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ds_processing_jobs: {
        Row: {
          id: string;
          tenant_id: string;
          datasheet_id: string;
          job_type: "extraction" | "generation" | "pdf_export";
          status: "pending" | "processing" | "completed" | "failed";
          input_data: Json;
          output_data: Json;
          error: string | null;
          attempts: number;
          max_attempts: number;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          datasheet_id: string;
          job_type: "extraction" | "generation" | "pdf_export";
          status?: "pending" | "processing" | "completed" | "failed";
          input_data?: Json;
          output_data?: Json;
          error?: string | null;
          attempts?: number;
          max_attempts?: number;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          datasheet_id?: string;
          job_type?: "extraction" | "generation" | "pdf_export";
          status?: "pending" | "processing" | "completed" | "failed";
          input_data?: Json;
          output_data?: Json;
          error?: string | null;
          attempts?: number;
          max_attempts?: number;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      ds_batch_jobs: {
        Row: {
          id: string;
          tenant_id: string;
          name: string | null;
          total_files: number;
          processed_files: number;
          failed_files: number;
          status: "pending" | "processing" | "completed" | "partial" | "failed";
          created_by: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name?: string | null;
          total_files?: number;
          processed_files?: number;
          failed_files?: number;
          status?: "pending" | "processing" | "completed" | "partial" | "failed";
          created_by?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string | null;
          total_files?: number;
          processed_files?: number;
          failed_files?: number;
          status?: "pending" | "processing" | "completed" | "partial" | "failed";
          created_by?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      ds_activity_log: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          datasheet_id: string | null;
          action: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          datasheet_id?: string | null;
          action: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string | null;
          datasheet_id?: string | null;
          action?: string;
          details?: Json;
          created_at?: string;
        };
      };
    };
  };
}

// ==============================================
// Application Types
// ==============================================

export type DatasheetStatus =
  | "uploading"
  | "extracting"
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "error";

export type UserRole = "admin" | "editor" | "reviewer";

// Helper types for easier access
export type Tenant = Database["public"]["Tables"]["ds_tenants"]["Row"];
export type TenantInsert = Database["public"]["Tables"]["ds_tenants"]["Insert"];

export type TenantUser = Database["public"]["Tables"]["ds_tenant_users"]["Row"];

export type DataSchema = Database["public"]["Tables"]["ds_data_schemas"]["Row"];

export type Template = Database["public"]["Tables"]["ds_templates"]["Row"];

export type Datasheet = Database["public"]["Tables"]["ds_datasheets"]["Row"];
export type DatasheetInsert = Database["public"]["Tables"]["ds_datasheets"]["Insert"];
export type DatasheetUpdate = Database["public"]["Tables"]["ds_datasheets"]["Update"];

export type ProcessingJob = Database["public"]["Tables"]["ds_processing_jobs"]["Row"];

export type BatchJob = Database["public"]["Tables"]["ds_batch_jobs"]["Row"];

export type ActivityLog = Database["public"]["Tables"]["ds_activity_log"]["Row"];

// ==============================================
// Schema Field Definition
// ==============================================

export interface SchemaField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "boolean";
  required: boolean;
  unit?: string;
  options?: string[];
}

// ==============================================
// Technical Specs (common for lighting products)
// ==============================================

export interface LightingSpecs {
  potencia?: string;
  lumenes?: string;
  temperatura_color?: string;
  indice_proteccion?: string;
  voltaje?: string;
  clase_electrica?: string;
  regulable?: string;
  tipo_led?: string;
  cri?: string;
}

// ==============================================
// Description Generation Preferences
// ==============================================

export type DescriptionTone = "formal" | "professional" | "casual";
export type DescriptionDetailLevel = "minimal" | "moderate" | "detailed";
export type DescriptionLength = "short" | "medium" | "long";
export type DescriptionFocusArea =
  | "materials"
  | "functionality"
  | "design"
  | "sustainability"
  | "innovation";

export interface DescriptionPreferences {
  tone: DescriptionTone;
  detail_level: DescriptionDetailLevel;
  length: DescriptionLength;
  focus_areas: DescriptionFocusArea[];
  brand_keywords: string;
  custom_instructions: string;
}

export interface TenantSettings {
  description_preferences?: DescriptionPreferences;
}

export const DEFAULT_DESCRIPTION_PREFERENCES: DescriptionPreferences = {
  tone: "professional",
  detail_level: "moderate",
  length: "medium",
  focus_areas: [],
  brand_keywords: "",
  custom_instructions: "",
};
