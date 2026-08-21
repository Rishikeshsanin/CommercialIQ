# CommercialIQ

**AI-Powered Commercial Decision Intelligence Platform**

CommercialIQ is an end-to-end applied-AI portfolio project that turns commercial data into forecasts, customer segments, risk signals, grounded knowledge answers, and actionable decision support. It is designed around the complete AI lifecycle: **data preparation → feature engineering → model training → validation → explainability → agentic analytics → deployment**.

> The public demo uses synthetic commercial data only. It is not a clinical or medical decision system.

## Core capabilities

- **Predictive modelling** — customer-risk classification with model comparison
- **Demand forecasting** — time-aware regression workflow with confidence-aware recommendations
- **Segmentation** — RFM feature engineering + K-Means customer clusters
- **Commercial analytics** — revenue, regions, products, anomalies and inventory signals
- **RAG-style grounding** — ranked business-document retrieval with page-level sources
- **AI agent** — tool routing across forecasting, segmentation, risk, anomaly and retrieval tools
- **Optional Generative AI** — grounded Gemini augmentation with deterministic fallback
- **SQL/PostgreSQL** — normalized, indexed, RLS-enabled commercial schema
- **Model validation** — MAE, RMSE, R², precision, recall, F1, ROC-AUC and silhouette score
- **Deployment-ready UI** — responsive React/Vite application and Vercel serverless API

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
Commercial data
     │
Data preparation + feature engineering
     │
 ┌───┼───────────────┐
 ▼   ▼               ▼
Forecasting       Segmentation       Risk model
Regression        RFM + K-Means      Classification
 └───┬───────────────┘
     ▼
Commercial tool layer
     │
 ┌───┴────────────────────┐
 ▼                        ▼
Knowledge retrieval    Agent orchestration
 └──────────┬─────────────┘
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
| Database | PostgreSQL-compatible schema, Supabase-ready RLS |
| GenAI | Optional Gemini grounding + deterministic fallback |
| CI/CD | GitHub Actions + Vercel |

## Run locally

```bash
npm install
npm run dev
```

The UI remains functional without secrets. For local serverless API execution, use `vercel dev` if the Vercel CLI is installed.

## Optional LLM mode

Copy `.env.example` to `.env.local` and set:

```env
GEMINI_API_KEY=your_key_here
```

`/api/agent` first computes tool outputs and retrieves supporting documents, then supplies only that grounded context to the model. If the provider is unavailable, the deterministic decision-support path continues to work.

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

## Database safety

`database/schema.sql` uses dedicated `commercial_*` tables and enables Row Level Security. Apply it only to a dedicated CommercialIQ database/project. The public web demo does **not** require a database secret and contains no anonymous write policy.

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
├── api/                   # serverless agent + health endpoints
├── database/              # PostgreSQL schema
├── ml/                    # reproducible Python ML pipeline
├── public/                # favicon/static assets
├── scripts/               # project integrity check
├── src/
│   ├── components/        # reusable UI primitives
│   ├── data/              # synthetic commercial demo data
│   ├── lib/               # analytics + chart helpers
│   ├── App.jsx
│   └── styles.css
├── .github/workflows/     # CI build validation
├── .env.example
├── vercel.json
└── README.md
```

## Why this is more than a notebook

CommercialIQ deliberately combines business problem framing, data preparation, feature engineering, multiple ML paradigms, experiment comparison, model evaluation, SQL data modelling, RAG-style grounding, agent/tool design, API engineering, responsive product design, CI and deployment.

## Responsible-use note

CommercialIQ is a **commercial analytics portfolio proof of concept**. Recommendations are illustrative decision support and require human review.
