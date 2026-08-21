-- CommercialIQ schema for the shared Supabase Project Hub.
-- SAFETY: apply only after CommercialIQ is registered in hub.apps and
-- `select hub.assert_app_scope('commercialiq', 'commercialiq');` succeeds.
-- This migration must never create ordinary app objects in public or another app schema.

create schema if not exists commercialiq;

create table if not exists commercialiq.customers (
  customer_id text primary key,
  region text not null,
  customer_type text not null,
  signup_date date,
  created_at timestamptz not null default now()
);

create table if not exists commercialiq.products (
  product_id text primary key,
  product_name text not null unique,
  category text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists commercialiq.transactions (
  transaction_id text primary key,
  transaction_date date not null,
  customer_id text not null references commercialiq.customers(customer_id),
  product_id text not null references commercialiq.products(product_id),
  region text not null,
  units integer not null check (units >= 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  discount_rate numeric(6,5) not null default 0 check (discount_rate between 0 and 1),
  marketing_spend numeric(14,2) not null default 0,
  inventory integer,
  revenue numeric(14,2) generated always as (units * unit_price * (1 - discount_rate)) stored,
  created_at timestamptz not null default now()
);

create index if not exists commercialiq_transactions_date_idx
  on commercialiq.transactions(transaction_date);
create index if not exists commercialiq_transactions_customer_idx
  on commercialiq.transactions(customer_id);
create index if not exists commercialiq_transactions_product_idx
  on commercialiq.transactions(product_id);
create index if not exists commercialiq_transactions_region_idx
  on commercialiq.transactions(region);

create table if not exists commercialiq.forecasts (
  forecast_id uuid primary key default gen_random_uuid(),
  generated_at timestamptz not null default now(),
  product_id text references commercialiq.products(product_id),
  forecast_period date not null,
  predicted_units numeric(14,2) not null,
  lower_bound numeric(14,2),
  upper_bound numeric(14,2),
  model_name text not null,
  model_version text not null
);

create table if not exists commercialiq.segments (
  customer_id text primary key references commercialiq.customers(customer_id),
  segment_name text not null,
  recency_days integer not null,
  frequency numeric(12,2) not null,
  monetary_value numeric(14,2) not null,
  cluster_id integer not null,
  scored_at timestamptz not null default now()
);

create table if not exists commercialiq.risk_predictions (
  prediction_id uuid primary key default gen_random_uuid(),
  customer_id text not null references commercialiq.customers(customer_id),
  risk_probability numeric(7,6) not null check (risk_probability between 0 and 1),
  model_name text not null,
  drivers jsonb not null default '{}'::jsonb,
  predicted_at timestamptz not null default now()
);

create table if not exists commercialiq.documents (
  document_id text primary key,
  title text not null,
  page_count integer,
  source_type text not null default 'business_document',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table commercialiq.customers enable row level security;
alter table commercialiq.products enable row level security;
alter table commercialiq.transactions enable row level security;
alter table commercialiq.forecasts enable row level security;
alter table commercialiq.segments enable row level security;
alter table commercialiq.risk_predictions enable row level security;
alter table commercialiq.documents enable row level security;

-- No permissive policies are included here. Add only minimum app-scoped policies
-- after access requirements are reviewed and cross-app isolation tests pass.
