# CommercialIQ

**AI-Powered Commercial Decision Intelligence Platform**

**Live Demo:** https://commercialiq-cyan.vercel.app  
**Repository:** https://github.com/Rishikeshsanin/CommercialIQ

CommercialIQ is an end-to-end applied-AI portfolio project that turns commercial data into forecasts, customer segments, risk signals, grounded knowledge answers, and actionable decision support. It is designed around the complete AI lifecycle: **data preparation → feature engineering → model training → validation → explainability → agentic analytics → deployment**.

> The public demo and database contain synthetic commercial data only. CommercialIQ is not a clinical or medical decision system.

## Core capabilities

- **Predictive modelling** — customer-risk classification with model comparison
- **Demand forecasting** — time-aware regression workflow with confidence-aware recommendations
- **Segmentation** — RFM feature engineering + K-Means customer clusters
- **Commercial analytics** — revenue, regions, products, anomalies and inventory signals
- **RAG-style grounding** — ranked business-document retrieval with sources
- **AI agent** — tool routing across forecasting, segmentation, risk, anomaly and retrieval tools
- **Optional Generative AI** — grounded Gemini augmentation with deterministic fallback
- **SQL/PostgreSQL** — normalized, indexed, RLS-enabled commercial schema
- **Model validation** — MAE, RMSE, R², precision, recall, F1, ROC-AUC and silhouette score
- **Deployment-ready UI** — responsive React/Vite application and Vercel serverless APIs

## Project Hub database

CommercialIQ is registered as **App #4** in a shared Supabase **Project Hub**.

| Item | Value |
|---|---|
| App number | `4` |
| App slug | `commercialiq` |
| Assigned schema | `commercialiq` |
| Data classification | Portfolio / synthetic |
| Access model | RLS + SELECT-only public demo reads |

The application is isolated to `commercialiq.*`. The repository-level safety contract is defined in `AGENTS.md` and `SUPABASE_HUB_RULES.md`.

The database currently contains:

- 100 synthetic customers
- 10 synthetic portfolio products
- 1,500 synthetic commercial transactions
- 30 forecast rows
- 100 customer segment assignments
- 100 predictive-risk outputs
- 5 synthetic business-document records

Every user-facing CommercialIQ table has RLS enabled. `anon` and `authenticated` receive **SELECT only**; insert, update, delete, truncate and schema-create privileges are not granted. No service-role or database-secret credential is used by the portfolio application.

## Product modules

1. **Commercial Command Center** — KPI and portfolio overview
2. **Demand Forecasting** — model comparison, forecast table and inventory signal
3. **Customer Segmentation** — interactive RFM/K-Means cluster exploration
4. **Predictive Risk** — high-value account prioritization and explainability-style drivers
5. **AI Commercial Analyst** — tool-using Q&A with sources, confidence and graceful fallback
6. **Knowledge RAG** — auditable business-document retrieval
7. **Model Lab** — experiment metrics across regression, classification and clustering
8. **Data Explorer** — transaction samples and engineered feature inventory

## Architecture

```text
Synthetic commercial data
          │
          ▼
Supabase Project Hub — App #4
commercialiq.* + RLS
          │
          ├──────────────► /api/commercial-data (read only)
          │
Data preparation + feature engineering
          │
 ┌────────┼───────────────┐
 ▼        ▼               ▼
Forecasting           Segmentation         Risk model
Regression            RFM + K-Means        Classification
 └────────┬───────────────┘
          ▼
Commercial tool layer
          │
 ┌────────┴────────────────────┐
 ▼                             ▼
Knowledge retrieval       Agent orchestration
 └────────────┬────────────────┘
              ▼
     Optional grounded LLM
              ▼
        React dashboard
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, responsive custom CSS/SVG visualization |
| API | Vercel Serverless Functions (Node.js) |
| ML | Python, Pandas, NumPy, Scikit-learn, Joblib |
| Models | Linear/Logistic Regression, Random Forest, Gradient Boosting, K-Means |
| Database | Supabase PostgreSQL Project Hub, `commercialiq` schema, RLS |
| GenAI | Optional Gemini grounding + deterministic fallback |
| CI/CD | GitHub Actions + Vercel |

## API routes

### `GET /api/health`

Returns application/API health and the active AI mode.

### `GET /api/commercial-data`

Read-only adapter for CommercialIQ's Project Hub schema. It uses the Supabase project URL and a **publishable** key only, queries `commercialiq` through the Data API, and returns aggregate metrics plus synthetic demo records. It contains no write operation and no privileged credential.

### `POST /api/agent`

Accepts `{ "question": "..." }`, chooses commercial-analysis tools, retrieves supporting business-document context, and returns a grounded decision brief. Gemini augmentation is optional; deterministic decision support remains available without an LLM key.

## Run locally

```bash
npm install
npm run dev
```

For local Vercel Functions, use:

```bash
vercel dev
```

## Optional LLM mode

Copy `.env.example` to `.env.local` and set:

```env
GEMINI_API_KEY=your_key_here
```

`/api/agent` computes tool outputs and supporting document context before supplying grounded context to the model. If the provider is unavailable, the deterministic path continues to work.

## Project Hub configuration

Use only the public Supabase URL and publishable key in ordinary application code:

```env
SUPABASE_URL=https://nowlwprtcnieihelqjoa.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Never place a database password, secret key, or service-role credential in this repository or in frontend code.

Before any future Supabase write, follow `AGENTS.md` and `SUPABASE_HUB_RULES.md`, read `hub.read_me_first`, verify the App #4 registry entry, and run:

```sql
select hub.assert_app_scope('commercialiq', 'commercialiq');
```

## Database migrations

Canonical app-scoped migrations are kept under `database/migrations/`:

```text
commercialiq__001_core_schema.sql
commercialiq__002_demo_data_and_read_policies.sql
commercialiq__003_fk_indexes.sql
```

They create or modify only `commercialiq.*`. The corresponding versions are recorded in `hub.schema_versions` as part of the approved Project Hub onboarding process.

## Train the ML models

```bash
cd ml
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python train_models.py
```

The pipeline trains forecasting, customer-risk and segmentation models and writes local artifacts to `ml/artifacts/` (git-ignored).

## Agent tool layer

```text
get_revenue_summary()
forecast_sales()
get_product_performance()
get_region_performance()
get_customer_segments()
identify_at_risk_customers()
detect_sales_anomalies()
query_commercial_database()
search_business_documents()
generate_executive_summary()
```

## Repository structure

```text
CommercialIQ/
├── AGENTS.md                       # app boundary / agent contract
├── SUPABASE_HUB_RULES.md           # Project Hub rules
├── api/                            # serverless agent, health and data endpoints
├── database/
│   ├── migrations/                 # app-scoped canonical migrations
│   └── schema.sql                  # core CommercialIQ schema reference
├── ml/                             # reproducible Python ML pipeline
├── public/                         # favicon/static assets
├── scripts/                        # project integrity checks
├── src/
│   ├── components/                 # reusable UI primitives
│   ├── data/                       # deterministic UI fallback data
│   ├── lib/                        # analytics + chart helpers
│   ├── App.jsx
│   └── styles.css
├── .github/workflows/              # CI build validation
├── .env.example
├── vercel.json
└── README.md
```

## Why this is more than a notebook

CommercialIQ combines business problem framing, data preparation, feature engineering, multiple ML paradigms, experiment comparison, model evaluation, SQL data modelling, RAG-style grounding, agent/tool design, API engineering, database security, responsive product design, CI and deployment.

## Responsible-use note

CommercialIQ is a **commercial analytics portfolio proof of concept**. Recommendations are illustrative decision support and require human review.
