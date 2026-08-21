-- CommercialIQ App #4 — synthetic portfolio data + read-only RLS policies
-- Scope: commercialiq.* only.

insert into commercialiq.customers (customer_id, region, customer_type, signup_date)
select
  'c' || lpad(gs::text, 3, '0'),
  (array['South','West','North','East'])[((gs - 1) % 4) + 1],
  (array['Enterprise','SMB','Growth'])[((gs - 1) % 3) + 1],
  current_date - ((gs * 7) % 900)
from generate_series(1, 100) gs
on conflict (customer_id) do nothing;

insert into commercialiq.products (product_id, product_name, category, unit_price)
select
  'p' || lpad(gs::text, 2, '0'),
  'Portfolio Product ' || chr(64 + gs),
  (array['Core','Specialty','Digital'])[((gs - 1) % 3) + 1],
  (1200 + gs * 275)::numeric(12,2)
from generate_series(1, 10) gs
on conflict (product_id) do nothing;

insert into commercialiq.transactions (
  transaction_id, transaction_date, customer_id, product_id, region,
  units, unit_price, discount_rate, marketing_spend, inventory
)
select
  't' || lpad(gs::text, 5, '0'),
  current_date - ((gs * 7) % 365),
  c.customer_id,
  p.product_id,
  c.region,
  1 + ((gs * 11) % 25),
  p.unit_price,
  (((gs % 6)::numeric) / 100)::numeric(6,5),
  (100 + ((gs * 17) % 900))::numeric(14,2),
  50 + ((gs * 23) % 300)
from generate_series(1, 1500) gs
join commercialiq.customers c
  on c.customer_id = 'c' || lpad((1 + ((gs * 13) % 100))::text, 3, '0')
join commercialiq.products p
  on p.product_id = 'p' || lpad((1 + ((gs * 7) % 10))::text, 2, '0')
on conflict (transaction_id) do nothing;

insert into commercialiq.forecasts (
  product_id, forecast_period, predicted_units, lower_bound, upper_bound, model_name, model_version
)
select
  p.product_id,
  (date_trunc('month', current_date) + (m || ' month')::interval)::date,
  (650 + (pn * 47) + (m * 38))::numeric(14,2),
  (600 + (pn * 43) + (m * 34))::numeric(14,2),
  (710 + (pn * 51) + (m * 42))::numeric(14,2),
  'GradientBoostingRegressor',
  'demo-v1'
from commercialiq.products p
cross join generate_series(1,3) m
cross join lateral (select substring(p.product_id from 2)::integer as pn) x
where not exists (
  select 1 from commercialiq.forecasts f
  where f.product_id=p.product_id
    and f.forecast_period=(date_trunc('month', current_date) + (m || ' month')::interval)::date
    and f.model_version='demo-v1'
);

insert into commercialiq.segments (
  customer_id, segment_name, recency_days, frequency, monetary_value, cluster_id
)
select
  c.customer_id,
  (array['High Value Loyal','Emerging','Price Sensitive','At Risk','Inactive'])[((n - 1) % 5) + 1],
  3 + ((n * 5) % 120),
  (2 + ((n * 3) % 28))::numeric(12,2),
  (15000 + ((n * 791) % 120000))::numeric(14,2),
  ((n - 1) % 5)
from commercialiq.customers c
cross join lateral (select substring(c.customer_id from 2)::integer as n) x
on conflict (customer_id) do update set
  segment_name=excluded.segment_name,
  recency_days=excluded.recency_days,
  frequency=excluded.frequency,
  monetary_value=excluded.monetary_value,
  cluster_id=excluded.cluster_id,
  scored_at=now();

insert into commercialiq.risk_predictions (
  customer_id, risk_probability, model_name, drivers
)
select
  c.customer_id,
  (0.05 + (((n * 17) % 90)::numeric / 100))::numeric(7,6),
  'GradientBoostingClassifier-demo-v1',
  jsonb_build_object(
    'recency', 0.20 + (((n * 3) % 20)::numeric / 100),
    'frequency_trend', 0.10 + (((n * 5) % 20)::numeric / 100),
    'value_trend', 0.10 + (((n * 7) % 20)::numeric / 100)
  )
from commercialiq.customers c
cross join lateral (select substring(c.customer_id from 2)::integer as n) x
where not exists (
  select 1 from commercialiq.risk_predictions rp
  where rp.customer_id=c.customer_id and rp.model_name='GradientBoostingClassifier-demo-v1'
);

insert into commercialiq.documents (document_id, title, page_count, source_type, metadata)
values
  ('doc-001','Q1 Commercial Performance Review',18,'business_document','{"period":"Q1","synthetic":true}'::jsonb),
  ('doc-002','Regional Growth Strategy',14,'business_document','{"topic":"regional_strategy","synthetic":true}'::jsonb),
  ('doc-003','Customer Segmentation Playbook',22,'business_document','{"topic":"segmentation","synthetic":true}'::jsonb),
  ('doc-004','Demand Planning Brief',11,'business_document','{"topic":"forecasting","synthetic":true}'::jsonb),
  ('doc-005','Commercial Risk Review',16,'business_document','{"topic":"risk","synthetic":true}'::jsonb)
on conflict (document_id) do nothing;

grant usage on schema commercialiq to anon, authenticated;
grant select on all tables in schema commercialiq to anon, authenticated;

create policy commercialiq_customers_read_only
  on commercialiq.customers for select to anon, authenticated using (true);
create policy commercialiq_products_read_only
  on commercialiq.products for select to anon, authenticated using (true);
create policy commercialiq_transactions_read_only
  on commercialiq.transactions for select to anon, authenticated using (true);
create policy commercialiq_forecasts_read_only
  on commercialiq.forecasts for select to anon, authenticated using (true);
create policy commercialiq_segments_read_only
  on commercialiq.segments for select to anon, authenticated using (true);
create policy commercialiq_risk_predictions_read_only
  on commercialiq.risk_predictions for select to anon, authenticated using (true);
create policy commercialiq_documents_read_only
  on commercialiq.documents for select to anon, authenticated using (true);

revoke insert, update, delete, truncate, references, trigger on all tables in schema commercialiq from anon, authenticated;
revoke create on schema commercialiq from anon, authenticated;
