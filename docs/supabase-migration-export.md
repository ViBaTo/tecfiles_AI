# Supabase Project Export - AIVO / VIBATO AI

**Project URL:** `https://qkdmerpjmskktkvabldf.supabase.co`  
**Export Date:** 2026-02-13  
**Purpose:** Migration to another database

---

## Table of Contents

1. [Enums (Custom Types)](#1-enums-custom-types)
2. [Tables Schema (public)](#2-tables-schema-public)
3. [Foreign Keys](#3-foreign-keys)
4. [Indexes](#4-indexes)
5. [Unique Constraints](#5-unique-constraints)
6. [RLS Policies (public)](#6-rls-policies-public)
7. [Storage Buckets](#7-storage-buckets)
8. [Storage Policies](#8-storage-policies)
9. [Functions / RPCs](#9-functions--rpcs)
10. [Triggers](#10-triggers)
11. [Extensions (Installed)](#11-extensions-installed)
12. [Migrations History](#12-migrations-history)
13. [Edge Functions](#13-edge-functions)
14. [Existing Data](#14-existing-data)

---

## 1. Enums (Custom Types)

### `batch_status`
- `pending`, `processing`, `completed`, `partial`, `failed`

### `datasheet_status`
- `uploading`, `extracting`, `draft`, `review`, `approved`, `published`, `error`

### `job_status`
- `pending`, `processing`, `completed`, `failed`

### `job_type`
- `extraction`, `generation`, `pdf_export`

### `template_type`
- `single`, `catalog_cover`, `catalog_page`

### `user_role`
- `admin`, `editor`, `reviewer`

---

## 2. Tables Schema (public)

### `products`
> Catálogo de productos/SaaS de VIBATO AI

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **code** (PK) | text | NO | - | PRIMARY KEY |
| name | text | NO | - | |
| description | text | YES | - | |
| logo_url | text | YES | - | |
| is_active | boolean | YES | `true` | |
| is_free_by_default | boolean | YES | `false` | |
| default_plan | text | YES | `'free'` | |
| created_at | timestamptz | YES | `now()` | |
| updated_at | timestamptz | YES | `now()` | |

---

### `user_profiles`
> Perfil unificado del usuario compartido entre todos los productos de VIBATO AI

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| user_id | uuid | NO | - | UNIQUE, FK → auth.users.id |
| full_name | text | YES | - | |
| avatar_url | text | YES | - | |
| company | text | YES | - | |
| phone | text | YES | - | |
| job_title | text | YES | - | |
| preferences | jsonb | YES | `'{"language":"es","timezone":"Europe/Madrid","marketing_emails":false,"email_notifications":true}'` | |
| created_at | timestamptz | YES | `now()` | |
| updated_at | timestamptz | YES | `now()` | |

---

### `user_product_access`
> Controla el acceso de usuarios a cada producto/SaaS y su plan

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| user_id | uuid | NO | - | FK → auth.users.id |
| product_code | text | NO | - | FK → products.code |
| plan | text | NO | `'free'` | |
| status | text | NO | `'active'` | CHECK: `active, inactive, trial, expired, canceled` |
| trial_ends_at | timestamptz | YES | - | |
| activated_at | timestamptz | YES | `now()` | |
| expires_at | timestamptz | YES | - | |
| metadata | jsonb | YES | `'{}'` | |
| created_at | timestamptz | YES | `now()` | |
| updated_at | timestamptz | YES | `now()` | |

**UNIQUE:** `(user_id, product_code)`

---

### `ft_tenants`
> Organizations/clients for multi-tenant isolation

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| name | text | NO | - | |
| slug | text | NO | - | UNIQUE |
| logo_url | text | YES | - | |
| brand_colors | jsonb | YES | `'{"primary":"#3B82F6","secondary":"#1E40AF"}'` | |
| settings | jsonb | YES | `'{}'` | |
| plan | text | NO | `'starter'` | |
| max_datasheets_month | integer | NO | `100` | |
| max_users | integer | NO | `5` | |
| max_templates | integer | NO | `3` | |
| status | text | NO | `'active'` | |
| created_at | timestamptz | NO | `now()` | |
| updated_at | timestamptz | NO | `now()` | |

---

### `ft_tenant_users`
> Many-to-many relationship between users and tenants with role assignment

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| tenant_id | uuid | NO | - | FK → ft_tenants.id |
| user_id | uuid | NO | - | FK → auth.users.id |
| role | user_role | NO | `'editor'` | ENUM |
| created_at | timestamptz | NO | `now()` | |

**UNIQUE:** `(tenant_id, user_id)`

---

### `ft_data_schemas`
> Configurable data field schemas per tenant/vertical

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| tenant_id | uuid | NO | - | FK → ft_tenants.id |
| name | text | NO | - | |
| slug | text | NO | - | |
| fields | jsonb | NO | `'[]'` | |
| description_prompt | text | YES | - | |
| is_default | boolean | NO | `false` | |
| created_at | timestamptz | NO | `now()` | |
| updated_at | timestamptz | NO | `now()` | |

**UNIQUE:** `(tenant_id, slug)`

---

### `ft_templates`
> PDF export templates per tenant with customizable layouts

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| tenant_id | uuid | NO | - | FK → ft_tenants.id |
| name | text | NO | - | |
| slug | text | NO | - | |
| template_type | template_type | NO | `'single'` | ENUM |
| layout | jsonb | NO | `'{}'` | |
| brand_config | jsonb | NO | `'{}'` | |
| thumbnail_url | text | YES | - | |
| is_default | boolean | NO | `false` | |
| created_at | timestamptz | NO | `now()` | |
| updated_at | timestamptz | NO | `now()` | |

**UNIQUE:** `(tenant_id, slug)`

---

### `ft_datasheets`
> Technical datasheets - main entity with product info, AI content, and workflow status

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| tenant_id | uuid | NO | - | FK → ft_tenants.id |
| schema_id | uuid | YES | - | FK → ft_data_schemas.id |
| template_id | uuid | YES | - | FK → ft_templates.id |
| project_code | text | YES | - | |
| article_name | text | YES | - | |
| material | text | YES | - | |
| finish | text | YES | - | |
| dimensions | text | YES | - | |
| weight | text | YES | - | |
| technical_specs | jsonb | NO | `'{}'` | |
| components | jsonb | NO | `'[]'` | |
| generated_description | text | YES | - | |
| description_language | text | NO | `'es'` | |
| generation_metadata | jsonb | NO | `'{}'` | |
| status | datasheet_status | NO | `'draft'` | ENUM |
| error_message | text | YES | - | |
| source_file_url | text | YES | - | |
| source_file_name | text | YES | - | |
| exported_pdf_url | text | YES | - | |
| created_by | uuid | YES | - | FK → auth.users.id |
| approved_by | uuid | YES | - | FK → auth.users.id |
| published_at | timestamptz | YES | - | |
| created_at | timestamptz | NO | `now()` | |
| updated_at | timestamptz | NO | `now()` | |

---

### `ft_processing_jobs`
> AI processing job queue for extraction, generation, and PDF export

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| tenant_id | uuid | NO | - | FK → ft_tenants.id |
| datasheet_id | uuid | NO | - | FK → ft_datasheets.id |
| job_type | job_type | NO | - | ENUM |
| status | job_status | NO | `'pending'` | ENUM |
| input_data | jsonb | NO | `'{}'` | |
| output_data | jsonb | NO | `'{}'` | |
| error | text | YES | - | |
| attempts | integer | NO | `0` | |
| max_attempts | integer | NO | `3` | |
| started_at | timestamptz | YES | - | |
| completed_at | timestamptz | YES | - | |
| created_at | timestamptz | NO | `now()` | |

---

### `ft_batch_jobs`
> Batch processing jobs for bulk file uploads

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| tenant_id | uuid | NO | - | FK → ft_tenants.id |
| name | text | YES | - | |
| total_files | integer | NO | `0` | |
| processed_files | integer | NO | `0` | |
| failed_files | integer | NO | `0` | |
| status | batch_status | NO | `'pending'` | ENUM |
| created_by | uuid | YES | - | FK → auth.users.id |
| started_at | timestamptz | YES | - | |
| completed_at | timestamptz | YES | - | |
| created_at | timestamptz | NO | `now()` | |

---

### `ft_activity_log`
> Audit trail for user actions and system events

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| tenant_id | uuid | NO | - | FK → ft_tenants.id |
| user_id | uuid | YES | - | FK → auth.users.id |
| datasheet_id | uuid | YES | - | FK → ft_datasheets.id |
| action | text | NO | - | |
| details | jsonb | NO | `'{}'` | |
| created_at | timestamptz | NO | `now()` | |

---

### `fb_books`
> FlipBook SaaS: Stores flipbook metadata, PDF info, and rendered pages

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| slug | text | NO | - | UNIQUE |
| user_id | uuid | YES | - | FK → auth.users.id |
| title | text | NO | `'Sin título'` | |
| description | text | YES | - | |
| pdf_url | text | NO | - | |
| pdf_filename | text | YES | - | |
| pdf_size_bytes | bigint | YES | - | |
| page_count | integer | YES | `0` | |
| pages_urls | jsonb | YES | `'[]'` | |
| status | text | NO | `'uploading'` | CHECK: `uploading, processing, ready, error` |
| error_message | text | YES | - | |
| settings | jsonb | YES | `'{"bg_color":"#1a1a2a","show_download":false,"show_page_count":true,"auto_flip_seconds":0}'` | |
| is_public | boolean | YES | `true` | |
| password_hash | text | YES | - | |
| is_anonymous | boolean | YES | `false` | |
| expires_at | timestamptz | YES | - | |
| created_at | timestamptz | YES | `now()` | |
| updated_at | timestamptz | YES | `now()` | |

---

### `fb_analytics`
> FlipBook SaaS: Tracks visitor engagement per flipbook

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| book_id | uuid | NO | - | FK → fb_books.id |
| visitor_ip | text | YES | - | |
| user_agent | text | YES | - | |
| referrer | text | YES | - | |
| country | text | YES | - | |
| city | text | YES | - | |
| device_type | text | YES | - | CHECK: `desktop, mobile, tablet` |
| pages_viewed | integer | YES | `0` | |
| max_page_reached | integer | YES | `0` | |
| time_spent_seconds | integer | YES | `0` | |
| is_embed | boolean | YES | `false` | |
| embed_domain | text | YES | - | |
| created_at | timestamptz | YES | `now()` | |

---

### `fb_subscriptions`
> FlipBook SaaS: User subscription and billing information

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| **id** (PK) | uuid | NO | `gen_random_uuid()` | PRIMARY KEY |
| user_id | uuid | YES | - | UNIQUE, FK → auth.users.id |
| stripe_customer_id | text | YES | - | |
| stripe_subscription_id | text | YES | - | |
| stripe_price_id | text | YES | - | |
| plan | text | NO | `'free'` | CHECK: `free, pro, business` |
| status | text | NO | `'active'` | CHECK: `active, canceled, past_due, trialing` |
| max_file_size_mb | integer | NO | `30` | |
| max_flipbooks | integer | NO | `3` | |
| max_pages_per_book | integer | NO | `50` | |
| remove_watermark | boolean | YES | `false` | |
| custom_domain | boolean | YES | `false` | |
| advanced_analytics | boolean | YES | `false` | |
| password_protection | boolean | YES | `false` | |
| current_period_start | timestamptz | YES | - | |
| current_period_end | timestamptz | YES | - | |
| cancel_at_period_end | boolean | YES | `false` | |
| created_at | timestamptz | YES | `now()` | |
| updated_at | timestamptz | YES | `now()` | |
| premium_credits | integer | YES | `0` | |

---

## 3. Foreign Keys

| Constraint | Source | Target |
|-----------|--------|--------|
| ft_tenant_users_tenant_id_fkey | ft_tenant_users.tenant_id | ft_tenants.id |
| ft_tenant_users_user_id_fkey | ft_tenant_users.user_id | auth.users.id |
| ft_data_schemas_tenant_id_fkey | ft_data_schemas.tenant_id | ft_tenants.id |
| ft_templates_tenant_id_fkey | ft_templates.tenant_id | ft_tenants.id |
| ft_datasheets_tenant_id_fkey | ft_datasheets.tenant_id | ft_tenants.id |
| ft_datasheets_schema_id_fkey | ft_datasheets.schema_id | ft_data_schemas.id |
| ft_datasheets_template_id_fkey | ft_datasheets.template_id | ft_templates.id |
| ft_datasheets_created_by_fkey | ft_datasheets.created_by | auth.users.id |
| ft_datasheets_approved_by_fkey | ft_datasheets.approved_by | auth.users.id |
| ft_processing_jobs_tenant_id_fkey | ft_processing_jobs.tenant_id | ft_tenants.id |
| ft_processing_jobs_datasheet_id_fkey | ft_processing_jobs.datasheet_id | ft_datasheets.id |
| ft_batch_jobs_tenant_id_fkey | ft_batch_jobs.tenant_id | ft_tenants.id |
| ft_batch_jobs_created_by_fkey | ft_batch_jobs.created_by | auth.users.id |
| ft_activity_log_tenant_id_fkey | ft_activity_log.tenant_id | ft_tenants.id |
| ft_activity_log_user_id_fkey | ft_activity_log.user_id | auth.users.id |
| ft_activity_log_datasheet_id_fkey | ft_activity_log.datasheet_id | ft_datasheets.id |
| fb_books_user_id_fkey | fb_books.user_id | auth.users.id |
| fb_analytics_book_id_fkey | fb_analytics.book_id | fb_books.id |
| fb_subscriptions_user_id_fkey | fb_subscriptions.user_id | auth.users.id |
| user_profiles_user_id_fkey | user_profiles.user_id | auth.users.id |
| user_product_access_user_id_fkey | user_product_access.user_id | auth.users.id |
| user_product_access_product_code_fkey | user_product_access.product_code | products.code |

---

## 4. Indexes

### fb_analytics
```sql
CREATE UNIQUE INDEX fb_analytics_pkey ON public.fb_analytics USING btree (id);
CREATE INDEX idx_fb_analytics_book_date ON public.fb_analytics USING btree (book_id, created_at);
CREATE INDEX idx_fb_analytics_book_id ON public.fb_analytics USING btree (book_id);
CREATE INDEX idx_fb_analytics_created_at ON public.fb_analytics USING btree (created_at);
```

### fb_books
```sql
CREATE UNIQUE INDEX fb_books_pkey ON public.fb_books USING btree (id);
CREATE UNIQUE INDEX fb_books_slug_key ON public.fb_books USING btree (slug);
CREATE INDEX idx_fb_books_is_public ON public.fb_books USING btree (is_public) WHERE (is_public = true);
CREATE INDEX idx_fb_books_slug ON public.fb_books USING btree (slug);
CREATE INDEX idx_fb_books_status ON public.fb_books USING btree (status);
CREATE INDEX idx_fb_books_user_id ON public.fb_books USING btree (user_id);
```

### fb_subscriptions
```sql
CREATE UNIQUE INDEX fb_subscriptions_pkey ON public.fb_subscriptions USING btree (id);
CREATE UNIQUE INDEX fb_subscriptions_user_id_key ON public.fb_subscriptions USING btree (user_id);
CREATE INDEX idx_fb_subscriptions_stripe_customer_id ON public.fb_subscriptions USING btree (stripe_customer_id);
CREATE INDEX idx_fb_subscriptions_user_id ON public.fb_subscriptions USING btree (user_id);
```

### ft_activity_log
```sql
CREATE UNIQUE INDEX ft_activity_log_pkey ON public.ft_activity_log USING btree (id);
CREATE INDEX idx_ft_activity_log_datasheet ON public.ft_activity_log USING btree (datasheet_id);
CREATE INDEX idx_ft_activity_log_tenant ON public.ft_activity_log USING btree (tenant_id);
CREATE INDEX idx_ft_activity_log_tenant_created ON public.ft_activity_log USING btree (tenant_id, created_at DESC);
CREATE INDEX idx_ft_activity_log_user ON public.ft_activity_log USING btree (user_id);
```

### ft_batch_jobs
```sql
CREATE UNIQUE INDEX ft_batch_jobs_pkey ON public.ft_batch_jobs USING btree (id);
CREATE INDEX idx_ft_batch_jobs_created_by ON public.ft_batch_jobs USING btree (created_by);
CREATE INDEX idx_ft_batch_jobs_status ON public.ft_batch_jobs USING btree (status) WHERE (status = ANY (ARRAY['pending', 'processing']));
CREATE INDEX idx_ft_batch_jobs_tenant ON public.ft_batch_jobs USING btree (tenant_id);
```

### ft_data_schemas
```sql
CREATE UNIQUE INDEX ft_data_schemas_pkey ON public.ft_data_schemas USING btree (id);
CREATE UNIQUE INDEX ft_data_schemas_tenant_id_slug_key ON public.ft_data_schemas USING btree (tenant_id, slug);
CREATE INDEX idx_ft_data_schemas_tenant ON public.ft_data_schemas USING btree (tenant_id);
```

### ft_datasheets
```sql
CREATE UNIQUE INDEX ft_datasheets_pkey ON public.ft_datasheets USING btree (id);
CREATE INDEX idx_ft_datasheets_approved_by ON public.ft_datasheets USING btree (approved_by);
CREATE INDEX idx_ft_datasheets_created_by ON public.ft_datasheets USING btree (created_by);
CREATE INDEX idx_ft_datasheets_schema_id ON public.ft_datasheets USING btree (schema_id);
CREATE INDEX idx_ft_datasheets_template_id ON public.ft_datasheets USING btree (template_id);
CREATE INDEX idx_ft_datasheets_tenant ON public.ft_datasheets USING btree (tenant_id);
CREATE INDEX idx_ft_datasheets_tenant_created ON public.ft_datasheets USING btree (tenant_id, created_at DESC);
CREATE INDEX idx_ft_datasheets_tenant_status ON public.ft_datasheets USING btree (tenant_id, status);
```

### ft_processing_jobs
```sql
CREATE UNIQUE INDEX ft_processing_jobs_pkey ON public.ft_processing_jobs USING btree (id);
CREATE INDEX idx_ft_processing_jobs_datasheet ON public.ft_processing_jobs USING btree (datasheet_id);
CREATE INDEX idx_ft_processing_jobs_status ON public.ft_processing_jobs USING btree (status) WHERE (status = ANY (ARRAY['pending', 'processing']));
CREATE INDEX idx_ft_processing_jobs_tenant ON public.ft_processing_jobs USING btree (tenant_id);
```

### ft_templates
```sql
CREATE UNIQUE INDEX ft_templates_pkey ON public.ft_templates USING btree (id);
CREATE UNIQUE INDEX ft_templates_tenant_id_slug_key ON public.ft_templates USING btree (tenant_id, slug);
CREATE INDEX idx_ft_templates_tenant ON public.ft_templates USING btree (tenant_id);
```

### ft_tenant_users
```sql
CREATE UNIQUE INDEX ft_tenant_users_pkey ON public.ft_tenant_users USING btree (id);
CREATE UNIQUE INDEX ft_tenant_users_tenant_id_user_id_key ON public.ft_tenant_users USING btree (tenant_id, user_id);
CREATE INDEX idx_ft_tenant_users_tenant ON public.ft_tenant_users USING btree (tenant_id);
CREATE INDEX idx_ft_tenant_users_user ON public.ft_tenant_users USING btree (user_id);
```

### ft_tenants
```sql
CREATE UNIQUE INDEX ft_tenants_pkey ON public.ft_tenants USING btree (id);
CREATE UNIQUE INDEX ft_tenants_slug_key ON public.ft_tenants USING btree (slug);
CREATE INDEX idx_ft_tenants_slug ON public.ft_tenants USING btree (slug);
```

### products
```sql
CREATE UNIQUE INDEX products_pkey ON public.products USING btree (code);
```

### user_product_access
```sql
CREATE UNIQUE INDEX user_product_access_pkey ON public.user_product_access USING btree (id);
CREATE UNIQUE INDEX user_product_access_user_id_product_code_key ON public.user_product_access USING btree (user_id, product_code);
CREATE INDEX idx_user_product_access_product_code ON public.user_product_access USING btree (product_code);
CREATE INDEX idx_user_product_access_status ON public.user_product_access USING btree (status);
CREATE INDEX idx_user_product_access_user_id ON public.user_product_access USING btree (user_id);
```

### user_profiles
```sql
CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);
CREATE UNIQUE INDEX user_profiles_user_id_key ON public.user_profiles USING btree (user_id);
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles USING btree (user_id);
```

---

## 5. Unique Constraints

| Table | Constraint | Columns |
|-------|-----------|---------|
| fb_books | fb_books_slug_key | slug |
| fb_subscriptions | fb_subscriptions_user_id_key | user_id |
| ft_data_schemas | ft_data_schemas_tenant_id_slug_key | tenant_id, slug |
| ft_templates | ft_templates_tenant_id_slug_key | tenant_id, slug |
| ft_tenant_users | ft_tenant_users_tenant_id_user_id_key | tenant_id, user_id |
| ft_tenants | ft_tenants_slug_key | slug |
| user_product_access | user_product_access_user_id_product_code_key | user_id, product_code |
| user_profiles | user_profiles_user_id_key | user_id |

---

## 6. RLS Policies (public)

### fb_analytics
| Policy | Command | Condition |
|--------|---------|-----------|
| fb_analytics_insert | INSERT | `true` (anyone can insert) |
| fb_analytics_owner_read | SELECT | `book_id IN (SELECT id FROM fb_books WHERE user_id = auth.uid())` |

### fb_books
| Policy | Command | Condition |
|--------|---------|-----------|
| fb_books_insert | INSERT | `auth.uid() = user_id OR user_id IS NULL` |
| fb_books_owner_delete | DELETE | `auth.uid() = user_id` |
| fb_books_owner_read | SELECT | `auth.uid() = user_id` |
| fb_books_owner_update | UPDATE | `auth.uid() = user_id OR user_id IS NULL` |
| fb_books_public_read | SELECT | `is_public = true AND status = 'ready'` |

### fb_subscriptions
| Policy | Command | Condition |
|--------|---------|-----------|
| Service role can manage subscriptions | ALL | `true` |
| Users can view their own subscription | SELECT | `auth.uid() = user_id` |

### ft_activity_log
| Policy | Command | Condition |
|--------|---------|-----------|
| System can insert activity logs | INSERT | `tenant_id IN (SELECT get_user_tenant_ids())` |
| Users can view tenant activity | SELECT | `tenant_id IN (SELECT get_user_tenant_ids())` |

### ft_batch_jobs
| Policy | Command | Condition |
|--------|---------|-----------|
| Editors can create batch jobs | INSERT | `tenant_id IN (...role IN ['admin','editor'])` |
| Users can view tenant batch jobs | SELECT | `tenant_id IN (SELECT get_user_tenant_ids())` |

### ft_data_schemas
| Policy | Command | Condition |
|--------|---------|-----------|
| Admins can delete tenant schemas | DELETE | `...role = 'admin'` |
| Admins can insert tenant schemas | INSERT | `...role = 'admin'` |
| Admins can update tenant schemas | UPDATE | `...role = 'admin'` |
| Users can view tenant schemas | SELECT | `tenant_id IN (SELECT get_user_tenant_ids())` |

### ft_datasheets
| Policy | Command | Condition |
|--------|---------|-----------|
| Admins can delete datasheets | DELETE | `...role = 'admin'` |
| Editors can create datasheets | INSERT | `...role IN ['admin','editor']` |
| Editors can update datasheets | UPDATE | `...role IN ['admin','editor']` |
| Users can view tenant datasheets | SELECT | `tenant_id IN (SELECT get_user_tenant_ids())` |

### ft_processing_jobs
| Policy | Command | Condition |
|--------|---------|-----------|
| Users can delete processing jobs | DELETE | `tenant_id IN (SELECT get_user_tenant_ids())` |
| Users can insert processing jobs | INSERT | `tenant_id IN (SELECT get_user_tenant_ids())` |
| Users can update processing jobs | UPDATE | `tenant_id IN (SELECT get_user_tenant_ids())` |
| Users can view tenant processing jobs | SELECT | `tenant_id IN (SELECT get_user_tenant_ids())` |

### ft_templates
| Policy | Command | Condition |
|--------|---------|-----------|
| Admins can delete tenant templates | DELETE | `...role = 'admin'` |
| Admins can insert tenant templates | INSERT | `...role = 'admin'` |
| Admins can update tenant templates | UPDATE | `...role = 'admin'` |
| Users can view tenant templates | SELECT | `tenant_id IN (SELECT get_user_tenant_ids())` |

### ft_tenant_users
| Policy | Command | Condition |
|--------|---------|-----------|
| Admins can delete tenant memberships | DELETE | `...role = 'admin'` |
| Admins can insert tenant memberships | INSERT | `...role = 'admin'` |
| Admins can update tenant memberships | UPDATE | `...role = 'admin'` |
| Users can view tenant memberships | SELECT | `tenant_id IN (SELECT get_user_tenant_ids())` |

### ft_tenants
| Policy | Command | Condition |
|--------|---------|-----------|
| Admins can update their tenants | UPDATE | `...role = 'admin'` |
| Users can view their tenants | SELECT | `id IN (SELECT get_user_tenant_ids())` |

### products
| Policy | Command | Condition |
|--------|---------|-----------|
| Products are viewable by everyone | SELECT | `is_active = true` |

### user_product_access
| Policy | Command | Condition |
|--------|---------|-----------|
| Users can view own product access | SELECT | `auth.uid() = user_id` |

### user_profiles
| Policy | Command | Condition |
|--------|---------|-----------|
| Users can insert own profile | INSERT | `auth.uid() = user_id` |
| Users can update own profile | UPDATE | `auth.uid() = user_id` |
| Users can view own profile | SELECT | `auth.uid() = user_id` |

---

## 7. Storage Buckets

| ID | Name | Public | Max Size | Allowed MIME Types |
|----|------|--------|----------|--------------------|
| datasheets | datasheets | No | 50 MB | pdf, png, jpeg, webp, octet-stream |
| flipbook-pages | flipbook-pages | Yes | 10 MB | webp, png, jpeg |
| flipbook-pdfs | flipbook-pdfs | No | 350 MB | pdf |

---

## 8. Storage Policies

### Bucket: `datasheets`
| Policy | Command | Condition |
|--------|---------|-----------|
| Users can view datasheet files | SELECT | `foldername[1] IN (tenant_ids del usuario)` |
| Editors can upload datasheet files | INSERT | `foldername[1] IN (tenants donde role = admin/editor)` |
| Editors can update datasheet files | UPDATE | `foldername[1] IN (tenants donde role = admin/editor)` |
| Admins can delete datasheet files | DELETE | `foldername[1] IN (tenants donde role = admin)` |

### Bucket: `flipbook-pages`
| Policy | Command | Condition |
|--------|---------|-----------|
| fb_pages_read | SELECT | `bucket_id = 'flipbook-pages'` |
| fb_pages_upload | INSERT | `bucket_id = 'flipbook-pages'` |
| fb_pages_update | UPDATE | `bucket_id = 'flipbook-pages'` |
| fb_pages_delete | DELETE | `bucket_id = 'flipbook-pages'` |

### Bucket: `flipbook-pdfs`
| Policy | Command | Condition |
|--------|---------|-----------|
| fb_pdfs_read | SELECT | `bucket_id = 'flipbook-pdfs'` |
| fb_pdfs_upload | INSERT | `bucket_id = 'flipbook-pdfs'` |
| fb_pdfs_delete | DELETE | `auth.uid()::text = foldername[1] OR foldername[1] = 'anonymous'` |

---

## 9. Functions / RPCs

### `get_user_tenant_ids()`
```sql
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT tenant_id FROM ft_tenant_users WHERE user_id = auth.uid()
$function$;
```

### `get_tenant_users(p_tenant_id uuid)`
```sql
CREATE OR REPLACE FUNCTION public.get_tenant_users(p_tenant_id uuid)
 RETURNS TABLE(id uuid, tenant_id uuid, user_id uuid, role user_role, created_at timestamptz, email text, display_name text, last_sign_in_at timestamptz)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    tu.id, tu.tenant_id, tu.user_id, tu.role, tu.created_at,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS display_name,
    u.last_sign_in_at
  FROM ft_tenant_users tu
  JOIN auth.users u ON u.id = tu.user_id
  WHERE tu.tenant_id = p_tenant_id
  ORDER BY tu.created_at ASC
$function$;
```

### `get_user_plan(product text)`
```sql
CREATE OR REPLACE FUNCTION public.get_user_plan(product text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT plan INTO user_plan
  FROM public.user_product_access 
  WHERE user_id = auth.uid() 
    AND product_code = product 
    AND status = 'active';
  RETURN user_plan;
END;
$function$;
```

### `has_product_access(product text, required_plan text)`
```sql
CREATE OR REPLACE FUNCTION public.has_product_access(product text, required_plan text DEFAULT NULL)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_product_access 
    WHERE user_id = auth.uid() 
      AND product_code = product 
      AND status = 'active'
      AND (required_plan IS NULL OR plan = required_plan)
  );
END;
$function$;
```

### `handle_new_user()` (Trigger Function)
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Grant access to products that are free by default
  INSERT INTO public.user_product_access (user_id, product_code, plan, status)
  SELECT 
    NEW.id, p.code, p.default_plan, 'active'
  FROM public.products p
  WHERE p.is_active = true AND p.is_free_by_default = true
  ON CONFLICT (user_id, product_code) DO NOTHING;

  RETURN NEW;
END;
$function$;
```

---

## 10. Triggers

### On `auth.users` (INSERT)
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### On public tables (UPDATE) - moddatetime
```sql
-- Auto-update updated_at on UPDATE
CREATE TRIGGER fb_books_updated_at BEFORE UPDATE ON fb_books EXECUTE FUNCTION moddatetime('updated_at');
CREATE TRIGGER fb_subscriptions_updated_at BEFORE UPDATE ON fb_subscriptions EXECUTE FUNCTION moddatetime('updated_at');
CREATE TRIGGER ft_data_schemas_updated_at BEFORE UPDATE ON ft_data_schemas EXECUTE FUNCTION moddatetime('updated_at');
CREATE TRIGGER ft_datasheets_updated_at BEFORE UPDATE ON ft_datasheets EXECUTE FUNCTION moddatetime('updated_at');
CREATE TRIGGER ft_templates_updated_at BEFORE UPDATE ON ft_templates EXECUTE FUNCTION moddatetime('updated_at');
CREATE TRIGGER ft_tenants_updated_at BEFORE UPDATE ON ft_tenants EXECUTE FUNCTION moddatetime('updated_at');
```

---

## 11. Extensions (Installed)

| Extension | Schema | Version | Description |
|-----------|--------|---------|-------------|
| plpgsql | pg_catalog | 1.0 | PL/pgSQL procedural language |
| pgcrypto | extensions | 1.3 | Cryptographic functions |
| moddatetime | extensions | 1.0 | Functions for tracking last modification time |
| uuid-ossp | extensions | 1.1 | Generate UUIDs |
| pg_stat_statements | extensions | 1.11 | Track execution statistics |
| supabase_vault | vault | 0.3.1 | Supabase Vault Extension |
| pg_graphql | graphql | 1.5.11 | GraphQL support |

---

## 12. Migrations History

| Version | Name |
|---------|------|
| 20260206221502 | create_enums_and_moddatetime |
| 20260206221549 | create_ft_tenants |
| 20260206221625 | create_ft_tenant_users |
| 20260206221644 | create_ft_data_schemas |
| 20260206221653 | create_ft_templates |
| 20260206221723 | create_ft_datasheets |
| 20260206221750 | create_ft_processing_jobs |
| 20260206221812 | create_ft_batch_jobs |
| 20260206221838 | create_ft_activity_log |
| 20260206221856 | enable_rls_and_policies |
| 20260206221937 | create_storage_bucket |
| 20260206222021 | fix_advisor_warnings |
| 20260206222634 | create_rpc_get_tenant_users |
| 20260206222929 | create_auto_assign_trigger |
| 20260208175946 | create_fb_books_table |
| 20260208180003 | create_fb_analytics_table |
| 20260208180022 | enable_fb_rls_policies |
| 20260208180113 | create_fb_storage_buckets |
| 20260208182254 | add_subscription_fields_to_fb_books |
| 20260208183827 | add_premium_credits_column |
| 20260208184811 | create_products_table |
| 20260208184826 | create_user_profiles_table |
| 20260208184839 | create_user_product_access_table |
| 20260208184951 | create_user_registration_trigger |
| 20260208185019 | add_rls_policies_multi_product |
| 20260208185133 | fix_function_search_path |

---

## 13. Edge Functions

**No hay Edge Functions desplegadas.**

---

## 14. Existing Data

### auth.users (2 rows)

| id | email | full_name | created_at |
|----|-------|-----------|------------|
| b689180a-e843-42fd-be74-7e7998d623ce | vicente@vibato.ai | Andrea González García | 2026-02-06 22:53:35 |
| 2930fb6e-880a-4855-a37c-191a68514f7e | andreaisagonzalezgarcia@gmail.com | Andrea Isabel González García | 2026-02-09 08:47:38 |

### products (2 rows)

| code | name | description | is_free_by_default | default_plan |
|------|------|-------------|--------------------|----|
| flipbook | FlipBook | Convierte PDFs en flipbooks interactivos | true | free |
| tecfiles | TecFiles.ai | Generador de fichas técnicas con IA | false | starter |

### ft_tenants (1 row)

| id | name | slug | plan | status |
|----|------|------|------|--------|
| 6ec7466f-c4fe-485f-a161-82496997486d | AIVO Demo | aivo-demo | professional | active |

### ft_tenant_users (1 row)

| tenant_id | user_id (email) | role |
|-----------|-----------------|------|
| 6ec7466f... (AIVO Demo) | b689180a... (vicente@vibato.ai) | admin |

### ft_data_schemas (2 rows)

| name | slug | is_default | fields (summary) |
|------|------|------------|------------------|
| Iluminación | iluminacion | true | casquillo, lampara_recomendada, potencia, lumenes, temperatura_color, numero_luces, grado_ip, clase_electrica, voltaje, regulable, necesita_montaje, driver, componentes, notas_fabricacion, cri |
| General | general | false | codigo_proyecto, codigo_pieza, tipo_plano, material, acabado, dimensiones, peso, materiales_detalle, unidades, escala, fecha_plano, desarrollo |

### ft_templates (2 rows)

| name | slug | template_type | is_default |
|------|------|---------------|------------|
| Ficha Técnica A4 | ficha-tecnica-a4 | single | true |
| Catálogo Portada | catalogo-portada | catalog_cover | false |

### user_profiles (2 rows)

| user_id (email) | full_name | preferences |
|-----------------|-----------|-------------|
| vicente@vibato.ai | Andrea González García | `{language: es, timezone: Europe/Madrid}` |
| andreaisagonzalezgarcia@gmail.com | Andrea Isabel González García | `{language: es, timezone: Europe/Madrid}` |

### user_product_access (3 rows)

| user (email) | product_code | plan | status |
|--------------|-------------|------|--------|
| vicente@vibato.ai | flipbook | free | active |
| vicente@vibato.ai | tecfiles | professional | active |
| andreaisagonzalezgarcia@gmail.com | flipbook | free | active |

### fb_books (1 row)

| slug | title | user (email) | status | page_count | is_public |
|------|-------|-------------|--------|------------|-----------|
| qyo95wqi | TFM | vicente@vibato.ai | ready | 77 | true |

### fb_subscriptions (1 row)

| user (email) | plan | status | stripe_customer_id | max_flipbooks | premium_credits |
|-------------|------|--------|-------------------|--------------|-----------------|
| vicente@vibato.ai | free | active | cus_TwsM0plaRFBM8K | 3 | 0 |

### fb_analytics (28 rows)
Registros de visitas al flipbook "TFM" (no detallados aquí por volumen).

### ft_datasheets, ft_processing_jobs, ft_batch_jobs, ft_activity_log
**Vacías** (0 rows).

---

## Notas para la Migración

1. **Auth:** La tabla `auth.users` es gestionada por Supabase Auth. En la nueva BD necesitarás un sistema de autenticación equivalente que maneje usuarios, sesiones y JWT.

2. **RLS:** Todas las tablas del schema `public` tienen RLS habilitado. Las políticas dependen de `auth.uid()` y funciones helper (`get_user_tenant_ids()`). Tendrás que reimplementar esta lógica de autorización.

3. **Storage:** Hay 3 buckets con ~867 objetos en total. Los archivos almacenados en Supabase Storage necesitarán migrarse a otro servicio (S3, Cloudflare R2, etc.).

4. **Triggers `moddatetime`:** Se usa la extensión `moddatetime` para auto-actualizar `updated_at`. Necesitarás equivalente (trigger manual o ORM).

5. **Trigger `handle_new_user`:** Se ejecuta al crear un usuario. Crea perfil + acceso a productos gratuitos automáticamente.

6. **Stripe Integration:** `fb_subscriptions` tiene `stripe_customer_id`. La integración con Stripe debe mantenerse.

7. **Dependencia en `auth.uid()`:** Las funciones RPC y políticas RLS dependen de la función `auth.uid()` de Supabase. Necesitarás un mecanismo equivalente.
