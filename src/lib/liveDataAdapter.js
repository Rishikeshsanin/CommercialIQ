import * as fallback from "../data/commercialData.js";

const fallbackById = (items) => new Map(items.map((item) => [item.id, item]));
const fallbackProducts = fallbackById(fallback.products);
const fallbackDocuments = fallbackById(fallback.documents);
const fallbackSegments = new Map(
  fallback.segments.map((segment) => [segment.name, segment]),
);
const fallbackRegions = new Map(
  fallback.regions.map((region) => [region.name, region]),
);

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round = (value, precision = 1) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const inMillions = (value) => round(number(value) / 1_000_000, 2);

const dateLabel = (value) => {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(value || "Forecast");
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
};

const monthLabel = (value) => {
  const normalized = String(value || "");
  const date = new Date(`${normalized}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return normalized || "Period";
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
};

const fallbackData = {
  months: fallback.months,
  revenueSeries: fallback.revenueSeries,
  demandSeries: fallback.demandSeries,
  products: fallback.products,
  regions: fallback.regions,
  segments: fallback.segments,
  riskCustomers: fallback.riskCustomers,
  modelResults: fallback.modelResults,
  forecast: fallback.forecast,
  productForecasts: {},
  anomalies: fallback.anomalies,
  documents: fallback.documents,
  dataPreview: fallback.dataPreview,
  kpis: fallback.kpis,
  dataCounts: { transactions: 120000, customers: 4418, products: 6 },
};

function growthFromTrends(trends, key) {
  if (!Array.isArray(trends) || trends.length < 3) return null;
  // The newest month can be partial. Compare the latest two completed periods.
  const latest = number(trends.at(-2)?.[key]);
  const previous = number(trends.at(-3)?.[key]);
  if (!previous) return null;
  return round(((latest - previous) / previous) * 100, 1);
}

function adaptRegions(regions) {
  const entries = Object.entries(regions || {});
  const totalRevenue = entries.reduce(
    (sum, [, metrics]) => sum + number(metrics?.revenue),
    0,
  );

  if (!entries.length) return fallback.regions;
  return entries
    .map(([name, metrics]) => {
      const demo = fallbackRegions.get(name);
      const revenue = number(metrics?.revenue);
      return {
        name,
        revenue: inMillions(revenue),
        growth: demo?.growth ?? 0,
        share: totalRevenue ? round((revenue / totalRevenue) * 100, 1) : 0,
        conversion: demo?.conversion ?? 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

function adaptForecasts(rows) {
  if (!Array.isArray(rows) || !rows.length) return fallback.forecast;
  const byPeriod = new Map();

  rows.forEach((row) => {
    const period = row.forecast_period;
    if (!period) return;
    const aggregate = byPeriod.get(period) || {
      month: dateLabel(period),
      units: 0,
      lower: 0,
      upper: 0,
    };
    aggregate.units += number(row.predicted_units);
    aggregate.lower += number(row.lower_bound);
    aggregate.upper += number(row.upper_bound);
    byPeriod.set(period, aggregate);
  });

  const values = [...byPeriod.entries()]
    .sort(([a], [b]) => String(a).localeCompare(String(b)))
    .map(([, value]) => ({
      ...value,
      units: Math.round(value.units),
      lower: Math.round(value.lower),
      upper: Math.round(value.upper),
    }));
  return values.length ? values : fallback.forecast;
}

function forecastByProduct(rows) {
  const values = new Map();
  [...(rows || [])]
    .sort((a, b) =>
      String(a.forecast_period).localeCompare(String(b.forecast_period)),
    )
    .forEach((row) => {
      if (!values.has(row.product_id))
        values.set(row.product_id, Math.round(number(row.predicted_units)));
    });
  return values;
}

function adaptProductForecasts(rows) {
  const values = {};
  [...(rows || [])]
    .sort((a, b) =>
      String(a.forecast_period).localeCompare(String(b.forecast_period)),
    )
    .forEach((row) => {
      const id = row.product_id;
      if (!id) return;
      values[id] ||= [];
      values[id].push({
        month: dateLabel(row.forecast_period),
        units: Math.round(number(row.predicted_units)),
        lower: Math.round(number(row.lower_bound)),
        upper: Math.round(number(row.upper_bound)),
      });
    });
  return values;
}

function adaptProducts(products, forecasts) {
  if (!Array.isArray(products) || !products.length) return fallback.products;
  const productForecasts = forecastByProduct(forecasts);

  return products.map((product) => {
    const id = product.product_id;
    const demo = fallbackProducts.get(id) || {};
    const units = number(product.units) || demo.units || 0;
    const predictedUnits = productForecasts.get(id) || demo.forecast || units;
    const inventory = number(product.inventory) || demo.inventory || 0;
    const growth = Number.isFinite(Number(product.growth))
      ? number(product.growth)
      : (demo.growth ?? 0);
    return {
      ...demo,
      id,
      name: product.product_name || demo.name || id,
      category: product.category || demo.category || "Portfolio",
      revenue: Number.isFinite(Number(product.revenue))
        ? inMillions(product.revenue)
        : demo.revenue || 0,
      growth: round(growth, 1),
      units: Math.round(units),
      forecast: predictedUnits,
      inventory,
      risk:
        inventory > 0 && inventory < predictedUnits
          ? "Supply watch"
          : growth < 0
            ? "Watch"
            : demo.risk || "Stable",
    };
  });
}

function adaptSegments(rows) {
  if (!Array.isArray(rows) || !rows.length) return fallback.segments;
  const grouped = new Map();

  rows.forEach((row) => {
    const name = row.segment_name || "Unassigned";
    const segment = grouped.get(name) || {
      name,
      size: 0,
      recency: 0,
      frequency: 0,
      monetary: 0,
    };
    segment.size += 1;
    segment.recency += number(row.recency_days);
    segment.frequency += number(row.frequency);
    segment.monetary += number(row.monetary_value);
    grouped.set(name, segment);
  });

  return [...grouped.values()]
    .map((segment) => {
      const demo = fallbackSegments.get(segment.name);
      const recency = round(segment.recency / segment.size, 1);
      const frequency = round(segment.frequency / segment.size, 1);
      const averageValue = segment.monetary / segment.size;
      const derivedScore = Math.round(
        Math.max(
          10,
          Math.min(
            100,
            65 - recency / 3 + frequency * 3 + Math.log10(averageValue + 1) * 4,
          ),
        ),
      );
      return {
        name: segment.name,
        size: segment.size,
        value: inMillions(segment.monetary),
        recency,
        frequency,
        score: demo?.score ?? derivedScore,
        action:
          demo?.action ||
          (name.toLowerCase().includes("risk")
            ? "Prioritize retention outreach and review recent engagement decline."
            : name.toLowerCase().includes("inactive")
              ? "Use low-cost reactivation and suppress outreach if response remains low."
              : name.toLowerCase().includes("high value")
                ? "Protect retention and test relevant premium cross-sell opportunities."
                : "Review this segment and define a targeted next-best action."),
      };
    })
    .sort((a, b) => b.value - a.value);
}

function driverReason(drivers) {
  if (!drivers) return "Elevated model risk based on recent customer behavior";
  if (typeof drivers === "string") {
    try {
      return driverReason(JSON.parse(drivers));
    } catch {
      return drivers;
    }
  }
  if (Array.isArray(drivers))
    return drivers
      .map((item) =>
        typeof item === "string" ? item : item?.name || item?.feature,
      )
      .filter(Boolean)
      .join(", ");
  const leading = Object.entries(drivers).sort(
    ([, a], [, b]) => Math.abs(number(b)) - Math.abs(number(a)),
  )[0];
  return leading
    ? `${leading[0].replaceAll("_", " ")} is the leading risk driver`
    : "Elevated model risk based on recent customer behavior";
}

function adaptRisks(risks, segmentRows) {
  if (!Array.isArray(risks) || !risks.length) return fallback.riskCustomers;
  const customers = new Map(
    (segmentRows || []).map((row) => [row.customer_id, row]),
  );

  return risks.map((row) => {
    const customer = customers.get(row.customer_id);
    const probability = number(row.risk_probability);
    return {
      id: row.customer_id,
      segment: customer?.segment_name || "Unassigned",
      value: number(customer?.monetary_value),
      risk: Math.round(probability <= 1 ? probability * 100 : probability),
      trend: 0,
      reason: driverReason(row.drivers),
    };
  });
}

function adaptDocuments(rows) {
  if (!Array.isArray(rows) || !rows.length) return fallback.documents;
  return rows.map((row) => {
    const id = row.document_id;
    const demo = fallbackDocuments.get(id);
    const metadata =
      row.metadata && typeof row.metadata === "object" ? row.metadata : {};
    const tags = Array.isArray(metadata.tags)
      ? metadata.tags.join(" ")
      : metadata.tags;
    return {
      id,
      title: row.title || demo?.title || id,
      page: number(metadata.page) || demo?.page || 1,
      pageCount: number(row.page_count) || undefined,
      topic:
        metadata.topic ||
        tags ||
        row.source_type ||
        demo?.topic ||
        "commercial",
      excerpt:
        metadata.excerpt ||
        metadata.summary ||
        metadata.description ||
        demo?.excerpt ||
        `Indexed ${row.source_type || "commercial"} document with ${number(row.page_count)} pages.`,
    };
  });
}

function adaptTransactions(rows, products) {
  if (!Array.isArray(rows) || !rows.length) return fallback.dataPreview;
  const names = new Map(
    (products || []).map((product) => [
      product.product_id,
      product.product_name,
    ]),
  );
  return rows.map((row) => {
    const units = number(row.units);
    const revenue = number(row.revenue);
    return [
      row.transaction_id,
      row.transaction_date,
      row.customer_id,
      names.get(row.product_id) || row.product_id,
      row.region || "Unknown",
      units,
      units ? revenue / units : 0,
      0,
      revenue,
    ];
  });
}

function adaptAnomalies(products, regions, risks, segments) {
  const signals = [];
  const highestRisk = [...risks].sort((a, b) => b.risk - a.risk)[0];
  const strongestGrowth = [...products].sort((a, b) => b.growth - a.growth)[0];
  const weakestGrowth = [...products].sort((a, b) => a.growth - b.growth)[0];
  const largestRegion = [...regions].sort((a, b) => b.share - a.share)[0];
  const highestValueSegment = [...segments].sort((a, b) => b.value - a.value)[0];

  if (highestRisk) {
    signals.push({
      level: highestRisk.risk >= 85 ? "high" : "medium",
      title: "Customer risk concentration",
      text: `${highestRisk.id} is the highest-priority account in the current risk ranking.`,
      metric: `${highestRisk.risk}%`,
    });
  }

  if (largestRegion) {
    signals.push({
      level: largestRegion.share >= 30 ? "medium" : "low",
      title: "Regional concentration",
      text: `${largestRegion.name} contributes the largest share of current portfolio revenue.`,
      metric: `${largestRegion.share}%`,
    });
  }

  if (weakestGrowth) {
    signals.push({
      level: weakestGrowth.growth <= -8 ? "high" : "medium",
      title: "Product watch",
      text: `${weakestGrowth.name} has the weakest recent revenue growth in the live portfolio view.`,
      metric: `${weakestGrowth.growth > 0 ? "+" : ""}${weakestGrowth.growth}%`,
    });
  }

  if (strongestGrowth) {
    signals.push({
      level: "low",
      title: "Growth opportunity",
      text: `${strongestGrowth.name} currently leads product growth and merits capacity review.`,
      metric: `${strongestGrowth.growth > 0 ? "+" : ""}${strongestGrowth.growth}%`,
    });
  } else if (highestValueSegment) {
    signals.push({
      level: "low",
      title: "Customer opportunity",
      text: `${highestValueSegment.name} is the highest-value customer segment in the current data.`,
      metric: `₹${highestValueSegment.value}M`,
    });
  }

  return signals.length ? signals.slice(0, 4) : fallback.anomalies;
}

export function getFallbackCommercialData() {
  return fallbackData;
}

export function adaptCommercialData(payload) {
  if (
    !payload?.ok ||
    payload.appNumber !== 4 ||
    payload.schema !== "commercialiq"
  ) {
    throw new Error("Commercial data response did not match the expected application scope.");
  }

  const revenueGrowth = growthFromTrends(payload.trends, "revenue");
  const unitGrowth = growthFromTrends(payload.trends, "units");
  const kpis = {
    ...fallback.kpis,
    revenue: inMillions(payload.metrics?.revenue),
    revenueGrowth: revenueGrowth ?? fallback.kpis.revenueGrowth,
    units: Math.round(number(payload.metrics?.units)),
    unitGrowth: unitGrowth ?? fallback.kpis.unitGrowth,
    customers: Math.round(number(payload.metrics?.customers)),
  };

  const products = adaptProducts(payload.products, payload.forecasts);
  const regions = adaptRegions(payload.regions);
  const segments = adaptSegments(payload.segments);
  const riskCustomers = adaptRisks(payload.risks, payload.segments);

  // Keep the polished 24-month presentation series until the synthetic Project
  // Hub contains a full 24 months, while all primary KPIs and analytical tables
  // use live data. This prevents a partial current month from distorting the UI.
  const hasFullTrend = Array.isArray(payload.trends) && payload.trends.length >= 24;
  const months = hasFullTrend
    ? payload.trends.slice(-24).map((row) => monthLabel(row.month))
    : fallback.months;
  const revenueSeries = hasFullTrend
    ? payload.trends.slice(-24).map((row) => inMillions(row.revenue))
    : fallback.revenueSeries;
  const demandSeries = hasFullTrend
    ? payload.trends.slice(-24).map((row) => Math.round(number(row.units)))
    : fallback.demandSeries;

  return {
    ...fallbackData,
    months,
    revenueSeries,
    demandSeries,
    kpis,
    products,
    regions,
    segments,
    riskCustomers,
    forecast: adaptForecasts(payload.forecasts),
    productForecasts: adaptProductForecasts(payload.forecasts),
    anomalies: adaptAnomalies(products, regions, riskCustomers, segments),
    documents: adaptDocuments(payload.documents),
    dataPreview: adaptTransactions(
      payload.recentTransactions,
      payload.products,
    ),
    dataCounts: {
      transactions: number(payload.rowCounts?.transactions),
      customers: kpis.customers,
      products: number(payload.rowCounts?.products),
    },
  };
}
