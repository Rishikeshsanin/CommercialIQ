// CommercialIQ — read-only Project Hub data adapter.
// Uses only the public Supabase project URL + publishable key. Never use a secret/service-role key here.
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://nowlwprtcnieihelqjoa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_487zTc09VarME-Fgf6EYig__47s_JTp";
const SCHEMA = "commercialiq";

// Friendly synthetic portfolio names for the public demo. The database remains
// unchanged; this is presentation-only naming at the read adapter boundary.
const PRODUCT_DISPLAY_NAMES = {
  p01: "Solvexa",
  p02: "NovaCore",
  p03: "Kinetra",
  p04: "Lumena",
  p05: "Virelix",
  p06: "Asteron",
  p07: "Arclune",
  p08: "Meridian",
  p09: "Velora",
  p10: "Nexora",
};

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function readTable(table, select = "*", query = "") {
  const params = new URLSearchParams({ select });
  const suffix = query ? `&${query}` : "";
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}${suffix}`,
    {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        "Accept-Profile": SCHEMA,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    let detail = null;
    try {
      detail = await response.json();
    } catch {
      detail = { message: await response.text() };
    }
    const error = new Error(
      detail?.message || `Supabase request failed (${response.status})`,
    );
    error.status = response.status;
    error.code = detail?.code || "SUPABASE_REQUEST_FAILED";
    error.detail = detail?.details || null;
    throw error;
  }

  return response.json();
}

async function readAllTable(table, select = "*", query = "") {
  const pageSize = 1000;
  const maxRows = 10000;
  let offset = 0;
  const rows = [];

  while (offset < maxRows) {
    const paging = `${query}${query ? "&" : ""}limit=${pageSize}&offset=${offset}`;
    const page = await readTable(table, select, paging);
    rows.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  return rows;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET." });

  try {
    const [transactions, products, segments, forecasts, risks, documents] =
      await Promise.all([
        readAllTable(
          "transactions",
          "transaction_id,transaction_date,customer_id,product_id,region,units,revenue,inventory,marketing_spend",
          "order=transaction_date.desc",
        ),
        readTable(
          "products",
          "product_id,product_name,category,unit_price",
          "order=product_id.asc",
        ),
        readTable(
          "segments",
          "customer_id,segment_name,recency_days,frequency,monetary_value,cluster_id",
          "order=customer_id.asc",
        ),
        readTable(
          "forecasts",
          "product_id,forecast_period,predicted_units,lower_bound,upper_bound,model_name,model_version",
          "order=forecast_period.asc",
        ),
        readTable(
          "risk_predictions",
          "customer_id,risk_probability,model_name,drivers,predicted_at",
          "order=risk_probability.desc",
        ),
        readTable(
          "documents",
          "document_id,title,page_count,source_type,metadata",
          "order=document_id.asc",
        ),
      ]);

    const revenue = transactions.reduce(
      (sum, row) => sum + asNumber(row.revenue),
      0,
    );
    const units = transactions.reduce(
      (sum, row) => sum + asNumber(row.units),
      0,
    );
    const customers = new Set(transactions.map((row) => row.customer_id)).size;

    const regions = transactions.reduce((acc, row) => {
      const key = row.region || "Unknown";
      const current = acc[key] || { revenue: 0, units: 0, transactions: 0 };
      current.revenue += asNumber(row.revenue);
      current.units += asNumber(row.units);
      current.transactions += 1;
      acc[key] = current;
      return acc;
    }, {});

    const monthlyTotals = transactions.reduce((acc, row) => {
      const month = String(row.transaction_date || "").slice(0, 7);
      if (!month) return acc;
      const current = acc[month] || { revenue: 0, units: 0, transactions: 0 };
      current.revenue += asNumber(row.revenue);
      current.units += asNumber(row.units);
      current.transactions += 1;
      acc[month] = current;
      return acc;
    }, {});

    const trends = Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-24)
      .map(([month, metrics]) => ({ month, ...metrics }));

    const productMetrics = transactions.reduce((acc, row) => {
      const key = row.product_id;
      const current = acc[key] || {
        revenue: 0,
        units: 0,
        transactions: 0,
        inventory: null,
        monthlyRevenue: {},
      };
      current.revenue += asNumber(row.revenue);
      current.units += asNumber(row.units);
      current.transactions += 1;
      // Transactions are read newest-first, so the first inventory value seen for
      // a product is the most recent inventory snapshot available in demo data.
      if (current.inventory === null && row.inventory !== null)
        current.inventory = asNumber(row.inventory);
      const month = String(row.transaction_date || "").slice(0, 7);
      if (month)
        current.monthlyRevenue[month] =
          (current.monthlyRevenue[month] || 0) + asNumber(row.revenue);
      acc[key] = current;
      return acc;
    }, {});

    const productsWithMetrics = products.map((product) => {
      const aggregate = productMetrics[product.product_id] || {
        revenue: 0,
        units: 0,
        transactions: 0,
        inventory: 0,
        monthlyRevenue: {},
      };
      const periods = Object.keys(aggregate.monthlyRevenue).sort();
      const latestComplete = aggregate.monthlyRevenue[periods.at(-2)] || 0;
      const previousComplete = aggregate.monthlyRevenue[periods.at(-3)] || 0;
      const growth = previousComplete
        ? ((latestComplete - previousComplete) / previousComplete) * 100
        : 0;
      return {
        ...product,
        product_name:
          PRODUCT_DISPLAY_NAMES[product.product_id] || product.product_name,
        revenue: aggregate.revenue,
        units: aggregate.units,
        transactions: aggregate.transactions,
        inventory: aggregate.inventory || 0,
        growth,
      };
    });

    return res.status(200).json({
      ok: true,
      source: "supabase-project-hub",
      appNumber: 4,
      schema: SCHEMA,
      synthetic: true,
      metrics: { revenue, units, customers },
      rowCounts: {
        transactions: transactions.length,
        products: products.length,
        segments: segments.length,
        forecasts: forecasts.length,
        riskPredictions: risks.length,
        documents: documents.length,
      },
      trends,
      regions,
      products: productsWithMetrics,
      segments,
      forecasts,
      risks: risks.slice(0, 25),
      documents,
      recentTransactions: transactions.slice(0, 12),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      source: "supabase-project-hub",
      appNumber: 4,
      schema: SCHEMA,
      error: error.code || "DATA_SOURCE_UNAVAILABLE",
      message: error.message,
      detail: error.detail || null,
    });
  }
}
