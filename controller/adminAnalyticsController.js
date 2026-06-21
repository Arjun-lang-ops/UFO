import Order from "../models/orderModel.js";
import Coupon from "../models/couponModel.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function growthPct(cur, prev) {
  if (prev === 0) return cur > 0 ? "100.0" : "0.0";
  return (((cur - prev) / prev) * 100).toFixed(1);
}

// Build the $group expression for the standard filters
function buildGroupExpr(filter) {
  if (filter === "daily" || filter === "custom") {
    return {
      year: { $year: "$orderedAt" },
      month: { $month: "$orderedAt" },
      day: { $dayOfMonth: "$orderedAt" },
    };
  } else if (filter === "weekly") {
    return {
      year: { $isoWeekYear: "$orderedAt" },
      week: { $isoWeek: "$orderedAt" },
    };
  } else {
    // yearly
    return {
      year: { $year: "$orderedAt" },
      month: { $month: "$orderedAt" },
    };
  }
}

// Build $sort for group expr
function buildSort(filter) {
  if (filter === "daily" || filter === "custom") {
    return { "_id.year": -1, "_id.month": -1, "_id.day": -1 };
  } else if (filter === "weekly") {
    return { "_id.year": -1, "_id.week": -1 };
  } else {
    return { "_id.year": -1, "_id.month": -1 };
  }
}

// Format a bucket label
function bucketLabel(filter, minDate, maxDate) {
  const opts = { day: "numeric", month: "short" };
  if (filter === "daily" || filter === "custom") {
    return new Date(minDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } else if (filter === "weekly") {
    const s = new Date(minDate);
    const e = new Date(maxDate);
    return `${s.toLocaleDateString("en-IN", opts)} – ${e.toLocaleDateString("en-IN", opts)}`;
  } else {
    return new Date(minDate).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }
}

// Aggregate across the whole collection (or date-restricted for custom)
async function aggregateAll(filter, startDate, endDate) {
  const match = { orderStatus: { $nin: ["Cancelled"] } };
  if (filter === "custom" && startDate && endDate) {
    match.orderedAt = { $gte: startDate, $lte: endDate };
  }

  const groupExpr = buildGroupExpr(filter);
  const buckets = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupExpr,
        salesCount: { $sum: 1 },
        grossAmount: { $sum: "$subTotal" },
        totalDiscount: { $sum: "$discount" },
        netRevenue: { $sum: "$totalAmount" },
        minDate: { $min: "$orderedAt" },
        maxDate: { $max: "$orderedAt" },
      },
    },
    { $sort: buildSort(filter) },
  ]);

  return buckets.map((bucket, idx, arr) => {
    const prevBucket = arr[idx + 1] || null;
    const growth = prevBucket
      ? growthPct(bucket.netRevenue, prevBucket.netRevenue)
      : null;

    return {
      label: bucketLabel(filter, bucket.minDate, bucket.maxDate),
      salesCount: bucket.salesCount,
      grossAmount: bucket.grossAmount,
      totalDiscount: bucket.totalDiscount,
      netRevenue: bucket.netRevenue,
      growth,
    };
  });
}

// KPI aggregate (all-time, or date-restricted for custom)
async function kpiAggregate(filter, startDate, endDate) {
  const match = { orderStatus: { $nin: ["Cancelled"] } };
  if (filter === "custom" && startDate && endDate) {
    match.orderedAt = { $gte: startDate, $lte: endDate };
  }
  const result = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        totalDiscount: { $sum: "$discount" },
      },
    },
  ]);
  return result[0] || { totalRevenue: 0, totalOrders: 0, totalDiscount: 0 };
}

// Period-restricted aggregate for KPI trend cards
async function periodAggregate(startDate, endDate) {
  const result = await Order.aggregate([
    {
      $match: {
        orderedAt: { $gte: startDate, $lte: endDate },
        orderStatus: { $nin: ["Cancelled"] },
      },
    },
    {
      $group: {
        _id: null,
        salesCount: { $sum: 1 },
        netRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  return result[0] || { salesCount: 0, netRevenue: 0 };
}

// Build the "current" and "previous" date windows for standard filters
function standardPeriodWindows(filter) {
  const now = new Date();
  let curStart, curEnd, prevStart, prevEnd;

  if (filter === "daily") {
    curStart = new Date(now);
    curStart.setHours(0, 0, 0, 0);
    curEnd = new Date(now);
    curEnd.setHours(23, 59, 59, 999);
    prevStart = new Date(now);
    prevStart.setDate(now.getDate() - 1);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd = new Date(prevStart);
    prevEnd.setHours(23, 59, 59, 999);
  } else if (filter === "weekly") {
    const dow = now.getDay() === 0 ? 7 : now.getDay();
    curStart = new Date(now);
    curStart.setDate(now.getDate() - dow + 1);
    curStart.setHours(0, 0, 0, 0);
    curEnd = new Date(curStart);
    curEnd.setDate(curStart.getDate() + 6);
    curEnd.setHours(23, 59, 59, 999);
    prevStart = new Date(curStart);
    prevStart.setDate(curStart.getDate() - 7);
    prevEnd = new Date(curEnd);
    prevEnd.setDate(curEnd.getDate() - 7);
  } else {
    // yearly
    const y = now.getFullYear(),
      m = now.getMonth();
    curStart = new Date(y, m, 1);
    curEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);
    prevStart = new Date(y, m - 1, 1);
    prevEnd = new Date(y, m, 0, 23, 59, 59, 999);
  }

  return { curStart, curEnd, prevStart, prevEnd };
}

// ─── Main page render ─────────────────────────────────────────────────────────

export const analyticsRender = async (req, res) => {
  try {
    const filter = req.query.filter || "daily";
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const LIMIT = 10;

    // Parse custom date range
    let startDate = null,
      endDate = null;
    if (filter === "custom") {
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate);
        startDate.setHours(0, 0, 0, 0);
      }
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
      }
      // If range is invalid fall back to all-time
      if (!startDate || !endDate || startDate > endDate) {
        startDate = null;
        endDate = null;
      }
    }

    // ── KPIs ──────────────────────────────────────────────────────────────
    const kpi = await kpiAggregate(filter, startDate, endDate);
    const avgOrderValue =
      kpi.totalOrders > 0 ? kpi.totalRevenue / kpi.totalOrders : 0;
    const activeCoupons = await Coupon.countDocuments({ isActive: true });

    // Growth % vs previous period (not applicable for custom)
    let revenueGrowth = "0.0",
      ordersGrowth = "0.0",
      aovGrowth = "0.0";
    let customRangeLabel = "";

    if (filter === "custom") {
      // For custom ranges we compare the range itself vs the same-length window before it
      if (startDate && endDate) {
        const rangeMs = endDate - startDate;
        const prevEnd2 = new Date(startDate.getTime() - 1);
        const prevStart2 = new Date(prevEnd2.getTime() - rangeMs);
        const [cur, prev] = await Promise.all([
          periodAggregate(startDate, endDate),
          periodAggregate(prevStart2, prevEnd2),
        ]);
        revenueGrowth = growthPct(cur.netRevenue, prev.netRevenue);
        ordersGrowth = growthPct(cur.salesCount, prev.salesCount);
        const curAOV = cur.salesCount ? cur.netRevenue / cur.salesCount : 0;
        const prevAOV = prev.salesCount ? prev.netRevenue / prev.salesCount : 0;
        aovGrowth = growthPct(curAOV, prevAOV);

        const fmt = (d) =>
          d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        customRangeLabel = `${fmt(startDate)} – ${fmt(endDate)}`;
      }
    } else {
      const { curStart, curEnd, prevStart, prevEnd } =
        standardPeriodWindows(filter);
      const [cur, prev] = await Promise.all([
        periodAggregate(curStart, curEnd),
        periodAggregate(prevStart, prevEnd),
      ]);
      revenueGrowth = growthPct(cur.netRevenue, prev.netRevenue);
      ordersGrowth = growthPct(cur.salesCount, prev.salesCount);
      const curAOV = cur.salesCount ? cur.netRevenue / cur.salesCount : 0;
      const prevAOV = prev.salesCount ? prev.netRevenue / prev.salesCount : 0;
      aovGrowth = growthPct(curAOV, prevAOV);
    }

    // ── Table buckets ─────────────────────────────────────────────────────
    const allBuckets = await aggregateAll(filter, startDate, endDate);

    const totalRows = allBuckets.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / LIMIT));
    const clampedPage = Math.min(page, totalPages);
    const skip = (clampedPage - 1) * LIMIT;
    const tableRows = allBuckets.slice(skip, skip + LIMIT);

    const tableTotal = allBuckets.reduce(
      (acc, b) => {
        acc.salesCount += b.salesCount;
        acc.grossAmount += b.grossAmount;
        acc.totalDiscount += b.totalDiscount;
        acc.netRevenue += b.netRevenue;
        return acc;
      },
      { salesCount: 0, grossAmount: 0, totalDiscount: 0, netRevenue: 0 },
    );

    // Format startDate/endDate as YYYY-MM-DD for <input type="date">
    const toInputDate = (d) => (d ? d.toISOString().slice(0, 10) : "");

    return res.render("adminViews/adminAnalyticsPage", {
      totalRevenue: kpi.totalRevenue,
      totalOrders: kpi.totalOrders,
      avgOrderValue,
      activeCoupons,
      revenueGrowth,
      ordersGrowth,
      aovGrowth,
      filter,
      startDateStr: toInputDate(startDate),
      endDateStr: toInputDate(endDate),
      customRangeLabel,
      tableRows,
      tableTotal,
      currentPage: clampedPage,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading analytics");
  }
};
