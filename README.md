# CommercialIQ

<div align="center">

### AI-Powered Commercial Decision Intelligence Platform

**Forecast demand · Segment customers · Prioritize risk · Ground answers with RAG · Turn signals into decisions**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?logo=vercel&logoColor=white)](https://commercialiq-cyan.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Scikit-learn](https://img.shields.io/badge/ML-Scikit--learn-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

**[Open Live Application](https://commercialiq-cyan.vercel.app)** · **[Repository](https://github.com/Rishikeshsanin/CommercialIQ)**

</div>

---

## Product Preview

![CommercialIQ dashboard overview](docs/screenshots/dashboard-overview.jpg)

> CommercialIQ is a portfolio proof of concept. All public demo/database records are synthetic and the application is **not** a clinical or medical decision system.

## What is CommercialIQ?

CommercialIQ is an end-to-end applied AI platform for commercial analytics. It combines **machine learning, data engineering, business intelligence, Retrieval-Augmented Generation (RAG), AI-agent orchestration, PostgreSQL, API engineering, responsive product design, security and cloud deployment** in one production-style project.

The platform is designed around a complete AI lifecycle:

```text
Commercial data
      ↓
Data preparation & validation
      ↓
Feature engineering
      ↓
Forecasting / Segmentation / Risk modeling
      ↓
Model evaluation & explainability
      ↓
RAG + tool-using AI analyst
      ↓
Decision-support dashboard
      ↓
Secure API + cloud deployment
```

## Why this project exists

Commercial teams rarely need "just a model". They need a system that can answer questions such as:

- What will demand look like over the next few periods?
- Which customers should receive retention attention first?
- Which regions and products are accelerating or declining?
- Where is inventory likely to become constrained or excessive?
- Which customer groups behave differently and why?
- Can an AI analyst provide a recommendation **with supporting evidence**?
- Can these capabilities be exposed safely through a deployable application?

CommercialIQ turns those questions into a coherent, testable product.

---

## Core Capabilities

| Capability | What CommercialIQ does |
|---|---|
| **Demand Forecasting** | Time-aware regression workflow, model comparison, confidence ranges and inventory-aware signals |
| **Customer Segmentation** | RFM feature engineering + K-Means clustering for behavioral commercial groups |
| **Predictive Risk** | Classification-based account prioritization with explainability-style drivers |
| **Commercial Analytics** | Revenue, units, product, regional, anomaly and inventory views |
| **RAG** | Ranked retrieval over synthetic commercial documents with source-aware responses |
| **AI Agent** | Routes questions across forecasting, segmentation, risk, anomaly and retrieval tools |
| **Model Evaluation** | MAE, RMSE, R², precision, recall, F1, ROC-AUC and silhouette score |
| **Data Layer** | Normalized PostgreSQL schema with RLS, indexes and scoped migrations |
| **Deployment** | React/Vite frontend + Vercel Serverless Functions + GitHub CI/CD |

## Product Modules

1. **Commercial Command Center**  
   KPI overview, revenue momentum, product performance, regional performance and prioritized signals.

2. **Demand Forecasting**  
   Model comparison, forecast horizon controls, confidence ranges and inventory-oriented recommendations.

3. **Customer Segmentation**  
   Interactive RFM/K-Means cluster exploration with value, recency, frequency and recommended actions.

4. **Predictive Risk**  
   High-risk customer prioritization, threshold controls and explainability-style risk drivers.

5. **AI Commercial Analyst**  
   Natural-language decision support using tool orchestration, supporting context and deterministic fallback.

6. **Knowledge RAG**  
   Source-aware retrieval across synthetic commercial documents.

7. **Model Lab**  
   Side-by-side experiment metrics across forecasting, classification and clustering.

8. **Data Explorer**  
   Transaction samples, features and operational data inspection.

---

## Example Use Cases

### Commercial planning
A business analyst can compare regional/product performance and combine current trends with forecasts before preparing a planning review.

### Demand & inventory planning
Forecasts expose expected units and uncertainty bands so planners can identify potential inventory pressure rather than relying only on a point estimate.

### Retention prioritization
Risk predictions and RFM segmentation help prioritize outreach to accounts with deteriorating engagement or high commercial value.

### Executive decision support
The AI analyst converts raw tool outputs and retrieved commercial context into a concise decision brief instead of exposing model results without interpretation.

### ML experimentation
The reproducible Python pipeline demonstrates model training, evaluation, artifact generation and comparison across multiple ML paradigms.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     React / Vite UI                         │
│ Overview · Forecasting · Segments · Risk · AI · RAG · Data │
└──────────────────────────────┬──────────────────────────────┘
                               │
                  Vercel Serverless Functions
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   /api/health       /api/commercial-data      /api/agent
                              │                    │
                              │             Tool orchestration
                              │                    │
                              ▼                    ▼
                    Supabase Project Hub      RAG / optional LLM
                    App #4: commercialiq
                              │
                    PostgreSQL + RLS + indexes
                              │
                Synthetic commercial datasets

Python ML pipeline
      │
      ├── forecasting
      ├── customer-risk classification
      └── RFM + K-Means segmentation
```

### Resilience strategy

The application includes deterministic demo/fallback data so the UI remains usable when optional external AI services are unavailable. The production read-only endpoint `/api/commercial-data` is connected to the App #4 Supabase schema and exposes synthetic Project Hub data through a publishable key only.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, JavaScript, responsive custom CSS, custom SVG charts |
| **Backend/API** | Vercel Serverless Functions, Node.js |
| **Machine Learning** | Python, Pandas, NumPy, Scikit-learn, Joblib |
| **Models** | Linear/Logistic Regression, Random Forest, Gradient Boosting, K-Means |
| **Database** | Supabase PostgreSQL |
| **Database Security** | Row Level Security (RLS), schema isolation, SELECT-only demo grants |
| **Generative AI** | Optional Gemini augmentation + deterministic fallback |
| **Retrieval** | RAG-style ranked commercial-document retrieval |
| **CI/CD** | GitHub Actions, Vercel Git deployment |
| **Version Control** | Git, GitHub |

---

## Database — Project Hub App #4

CommercialIQ is registered as **App #4** in the shared Supabase Project Hub.

| Property | Value |
|---|---|
| App number | `4` |
| App slug | `commercialiq` |
| Assigned schema | `commercialiq` |
| Data type | Synthetic portfolio data |
| Public demo access | SELECT only |
| RLS | Enabled on all user-facing tables |

### Current synthetic dataset

- **100** customers
- **10** commercial products
- **1,500** transactions
- **30** forecast records
- **100** customer segment assignments
- **100** predictive-risk outputs
- **5** synthetic commercial knowledge documents

### Isolation guarantee

CommercialIQ owns only:

```text
commercialiq.*
```

It does **not** own or modify other Project Hub application schemas. The repository safety contract is documented in:

- `AGENTS.md`
- `SUPABASE_HUB_RULES.md`

Before any future Supabase write:

```sql
select hub.assert_app_scope('commercialiq', 'commercialiq');
```

Never commit a database password, Supabase service-role credential or another application's secrets.

---

## API Reference

### `GET /api/health`

Health/status endpoint.

Example:

```json
{
  "ok": true,
  "service": "CommercialIQ API",
  "mode": "deterministic-demo"
}
```

### `GET /api/commercial-data`

Read-only adapter for the Supabase Project Hub `commercialiq` schema.

It returns:

- aggregate revenue / units / customer metrics
- row counts
- regional aggregates
- products
- segments
- forecasts
- risk predictions
- knowledge documents
- recent transactions

No write operation or privileged database credential is used.

### `POST /api/agent`

Request:

```json
{
  "question": "Which customer segments need attention?"
}
```

The agent selects relevant commercial tools, retrieves supporting business context and returns a grounded decision brief. Gemini augmentation is optional; deterministic decision support remains available without an LLM key.

---

# Local Development

## Prerequisites

Install:

- **Node.js 20+**
- **npm**
- **Git**
- **Python 3.10+** only if you want to retrain ML models
- **Vercel CLI** only if you want local serverless functions

Check your environment:

```bash
node --version
npm --version
git --version
python --version
```

## 1. Clone the repository

```bash
git clone https://github.com/Rishikeshsanin/CommercialIQ.git
cd CommercialIQ
```

## 2. Install frontend dependencies

```bash
npm install
```

## 3. Start the React development server

```bash
npm run dev
```

Vite will print a local URL, normally:

```text
http://localhost:5173
```

## 4. Run quality checks

```bash
npm run check
npm run build
```

A successful production build is written to `dist/`.

---

## Running Serverless APIs Locally

The browser-only Vite dev server does not emulate Vercel Functions. To test `/api/*` locally, install Vercel CLI:

```bash
npm install -g vercel
```

Then from the repository root:

```bash
vercel dev
```

This runs the frontend and Vercel serverless routes together.

---

## Environment Variables

Copy the example environment file:

### Windows PowerShell

```powershell
Copy-Item .env.example .env.local
```

### macOS / Linux

```bash
cp .env.example .env.local
```

Supported variables:

```env
SUPABASE_URL=https://nowlwprtcnieihelqjoa.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
GEMINI_API_KEY=optional_gemini_key
```

### Security rules

Safe for application configuration:

- Supabase project URL
- Supabase publishable/anon key

Never commit:

- Supabase service-role key
- database password
- private API keys
- credentials belonging to another Project Hub application

`GEMINI_API_KEY` should be stored only in `.env.local` or Vercel Environment Variables.

---

# Machine Learning Pipeline

## Create a virtual environment

```bash
cd ml
python -m venv .venv
```

### Windows

```powershell
.\.venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
source .venv/bin/activate
```

## Install ML dependencies

```bash
pip install -r requirements.txt
```

## Train models

```bash
python train_models.py
```

The training workflow covers:

- demand forecasting
- customer-risk classification
- customer segmentation
- model comparison
- validation metrics
- local model artifact generation

Generated model artifacts are written under `ml/artifacts/` and are intentionally git-ignored.

### Evaluation metrics

**Forecasting**
- MAE
- RMSE
- R²

**Classification**
- Precision
- Recall
- F1
- ROC-AUC

**Clustering**
- Silhouette score
- RFM cluster profiling

---

## Agent Tool Layer

CommercialIQ's AI analyst is designed around callable commercial tools rather than a free-form chatbot alone.

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

This architecture allows recommendations to be grounded in explicit analytical outputs before optional LLM augmentation.

---

## Database Migrations

Canonical CommercialIQ-only migrations are stored in:

```text
database/migrations/
├── commercialiq__001_core_schema.sql
├── commercialiq__002_demo_data_and_read_policies.sql
└── commercialiq__003_fk_indexes.sql
```

These migrations create or modify **only** `commercialiq.*` resources.

---

## Repository Structure

```text
CommercialIQ/
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI build/API syntax validation
├── api/
│   ├── agent.js                   # AI analyst endpoint
│   ├── commercial-data.js         # read-only Supabase adapter
│   └── health.js                  # health endpoint
├── database/
│   ├── migrations/                # app-scoped SQL migrations
│   └── schema.sql                 # schema reference
├── docs/
│   └── screenshots/               # product screenshots
├── ml/
│   ├── requirements.txt
│   └── train_models.py            # reproducible ML training pipeline
├── public/                        # static assets
├── scripts/                       # integrity checks
├── src/
│   ├── components/                # reusable UI components
│   ├── data/                      # deterministic fallback/demo data
│   ├── lib/                       # analytics/chart helpers
│   ├── App.jsx
│   └── styles.css
├── AGENTS.md                      # application ownership contract
├── SUPABASE_HUB_RULES.md          # shared Project Hub safety rules
├── .env.example
├── package.json
├── vercel.json
└── README.md
```

---

# CI/CD

GitHub Actions runs on pushes to `main` and pull requests.

CI validates:

```text
npm install
npm run check
npm run build
node --check api/agent.js
node --check api/commercial-data.js
node --check api/health.js
```

Vercel is Git-connected to the repository. A successful push to the production branch triggers an automatic deployment.

---

# Deploy to Vercel

## Dashboard method

1. Open Vercel.
2. Import or connect `Rishikeshsanin/CommercialIQ`.
3. Framework preset: **Vite**.
4. Production branch: **main**.
5. Add required environment variables.
6. Deploy.

## Environment variables on Vercel

Open:

```text
Project → Settings → Environment Variables
```

Add only the variables needed by CommercialIQ.

Recommended scopes:

```text
Production
Preview
Development (optional)
```

After changing variables, redeploy the latest production deployment.

## Production verification

Check:

```text
https://commercialiq-cyan.vercel.app/
https://commercialiq-cyan.vercel.app/api/health
https://commercialiq-cyan.vercel.app/api/commercial-data
```

---

## Manual Testing Checklist

After every significant release:

- [ ] Overview loads without console errors
- [ ] Navigation works on desktop
- [ ] Mobile navigation opens/closes correctly
- [ ] Forecast filters work
- [ ] Segment selection works
- [ ] Risk threshold slider updates results
- [ ] AI Analyst accepts a prompt
- [ ] Knowledge RAG view renders
- [ ] Model Lab renders metrics
- [ ] Data Explorer renders records/features
- [ ] `/api/health` returns `200`
- [ ] `/api/commercial-data` returns `200`
- [ ] GitHub Actions is green
- [ ] Vercel production deployment is `READY`

---

## Troubleshooting

### `npm run dev` works but `/api/*` returns 404

Use:

```bash
vercel dev
```

Vite alone does not emulate Vercel Serverless Functions.

### Supabase reports an invalid schema

Confirm the `commercialiq` schema is enabled under the project's **Data API → Exposed schemas** configuration. Do not remove or alter schemas belonging to other Project Hub applications.

### AI Analyst says deterministic mode

This is expected when `GEMINI_API_KEY` is not configured. The application intentionally falls back to deterministic commercial decision support.

### Supabase reads fail

Verify:

```env
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

and confirm RLS/read policies remain enabled for `commercialiq.*`.

---

## Responsible AI & Security

CommercialIQ intentionally applies several safeguards:

- synthetic public demo data only
- human-review framing for recommendations
- RLS on user-facing database tables
- SELECT-only public demo access
- no service-role key in frontend/application code
- app-scoped SQL migrations
- Project Hub schema isolation
- deterministic fallback when external LLM services fail
- grounded retrieval/tool outputs before generative recommendations

Recommendations are illustrative decision support and should not be treated as autonomous business or medical decisions.

---

## What this project demonstrates

CommercialIQ is intentionally more than a machine-learning notebook. It demonstrates the ability to combine:

- business problem framing
- data preparation
- feature engineering
- forecasting
- classification
- clustering
- model evaluation
- explainability concepts
- SQL data modeling
- database security
- REST/serverless APIs
- RAG
- AI agents/tool routing
- responsive frontend engineering
- CI/CD
- cloud deployment

into a single portfolio-grade application.

---

## Future Improvements

- Fully hydrate every dashboard module directly from the live Project Hub API while preserving deterministic fallback data
- Persist model-version metadata and experiment history
- Add time-series backtesting visualizations
- Add richer SHAP artifact visualization
- Add document embeddings/vector retrieval for larger knowledge collections
- Add authenticated analyst workspaces for non-demo deployments
- Add automated end-to-end browser tests

---

## License / Usage

This repository is provided as an educational and portfolio project. Any real-world implementation should replace synthetic data, validate business assumptions, introduce appropriate authentication/authorization and complete security/privacy review before production use.

---

<div align="center">

### CommercialIQ
**From commercial data to grounded, explainable action.**

[Live Demo](https://commercialiq-cyan.vercel.app) · [GitHub](https://github.com/Rishikeshsanin/CommercialIQ)

</div>
