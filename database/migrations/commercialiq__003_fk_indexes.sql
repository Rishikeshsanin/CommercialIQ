-- CommercialIQ App #4 — performance indexes for foreign keys
-- Scope: commercialiq.* only.

create index if not exists commercialiq_forecasts_product_idx
  on commercialiq.forecasts(product_id);

create index if not exists commercialiq_risk_predictions_customer_idx
  on commercialiq.risk_predictions(customer_id);
