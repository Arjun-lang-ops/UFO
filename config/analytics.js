import Order from "../models/orderModel.js";
import Coupon from '../models/couponModel.js';
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";


// ─── Shared: fetch all buckets for a given filter ─────────────────────────────
async function fetchAllBuckets(filter, startDate, endDate) {
    let groupByExpr;

    // "custom" has no natural bucket size of its own — fall back to daily
    // buckets within the chosen range so the table still makes sense.
    const effectiveFilter = filter === "custom" ? "daily" : filter;

    if (effectiveFilter === "daily") {
        groupByExpr = {
            year: { $year: "$orderedAt" },
            month: { $month: "$orderedAt" },
            day: { $dayOfMonth: "$orderedAt" },
        };
    } else if (effectiveFilter === "weekly") {
        groupByExpr = {
            year: { $isoWeekYear: "$orderedAt" },
            week: { $isoWeek: "$orderedAt" },
        };
    } else {
        groupByExpr = {
            year: { $year: "$orderedAt" },
            month: { $month: "$orderedAt" },
        };
    }

    // Build the match stage — always exclude cancelled orders,
    // and apply a date range whenever one is supplied (custom filter).
    const match = { orderStatus: { $nin: ["Cancelled"] } };
    if (startDate || endDate) {
        match.orderedAt = {};
        if (startDate) {
            const s = new Date(startDate);
            s.setHours(0, 0, 0, 0);
            match.orderedAt.$gte = s;
        }
        if (endDate) {
            const e = new Date(endDate);
            e.setHours(23, 59, 59, 999);
            match.orderedAt.$lte = e;
        }
    }

    const buckets = await Order.aggregate([
        { $match: match },
        {
            $group: {
                _id: groupByExpr,
                salesCount: { $sum: 1 },
                grossAmount: { $sum: "$subTotal" },
                totalDiscount: { $sum: "$discount" },
                netRevenue: { $sum: "$totalAmount" },
                minDate: { $min: "$orderedAt" },
                maxDate: { $max: "$orderedAt" },
            },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1, "_id.week": -1 } },
    ]);

    return buckets.map((bucket, idx, arr) => {
        const prevBucket = arr[idx + 1] || null;
        const growthVal = prevBucket && prevBucket.netRevenue > 0
            ? (((bucket.netRevenue - prevBucket.netRevenue) / prevBucket.netRevenue) * 100).toFixed(1)
            : null;

        let label;
        if (effectiveFilter === "daily") {
            label = new Date(bucket.minDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
        } else if (effectiveFilter === "weekly") {
            const s = new Date(bucket.minDate);
            const e = new Date(bucket.maxDate);
            label = `${s.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${e.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
        } else {
            label = new Date(bucket.minDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        }

        return {
            label,
            salesCount: bucket.salesCount,
            grossAmount: bucket.grossAmount,
            totalDiscount: bucket.totalDiscount,
            netRevenue: bucket.netRevenue,
            growth: growthVal,
        };
    });
}

// ─── Export PDF ───────────────────────────────────────────────────────────────
export const analyticsPdfExport = async (req, res) => {
    try {
        const filter = req.query.filter || "daily";
        const { startDate, endDate } = req.query;
        const rows = await fetchAllBuckets(filter, startDate, endDate);

        const filterLabel = filter === "daily" ? "Daily"
            : filter === "weekly" ? "Weekly"
            : filter === "custom" ? "Custom Range"
            : "Monthly (Yearly)";
        const generatedAt = new Date().toLocaleString("en-IN");
        const rangeLabel = filter === "custom" && startDate && endDate
            ? `${new Date(startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} – ${new Date(endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
            : null;

        // KPI + match stage must respect the same date range as the table
        const kpiMatch = { orderStatus: { $nin: ["Cancelled"] } };
        if (startDate || endDate) {
            kpiMatch.orderedAt = {};
            if (startDate) { const s = new Date(startDate); s.setHours(0,0,0,0); kpiMatch.orderedAt.$gte = s; }
            if (endDate)   { const e = new Date(endDate);   e.setHours(23,59,59,999); kpiMatch.orderedAt.$lte = e; }
        }

        const kpiAgg = await Order.aggregate([
            { $match: kpiMatch },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 }, totalDiscount: { $sum: "$discount" } } },
        ]);
        const kpi = kpiAgg[0] || { totalRevenue: 0, totalOrders: 0, totalDiscount: 0 };
        const avgOV = kpi.totalOrders > 0 ? (kpi.totalRevenue / kpi.totalOrders).toFixed(2) : "0.00";
        const activeCoupons = await Coupon.countDocuments({ isActive: true });

        const tableTotal = rows.reduce(
            (acc, r) => { acc.salesCount += r.salesCount; acc.grossAmount += r.grossAmount; acc.totalDiscount += r.totalDiscount; acc.netRevenue += r.netRevenue; return acc; },
            { salesCount: 0, grossAmount: 0, totalDiscount: 0, netRevenue: 0 },
        );

        const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="sales-analytics-${filter}-${Date.now()}.pdf"`);
        doc.pipe(res);

        // ── Header ──
        const PRIMARY = "#137fec";
        doc.rect(0, 0, doc.page.width, 70).fill(PRIMARY);
        doc.fillColor("white").fontSize(22).font("Helvetica-Bold").text("FootyGear — Sales Analytics Report", 40, 18);
        doc.fontSize(10).font("Helvetica").text(
            `Filter: ${filterLabel}${rangeLabel ? ` (${rangeLabel})` : ""}   ·   Generated: ${generatedAt}`,
            40, 46
        );
        doc.fillColor("black");

        // ── KPI Summary boxes ──
        const kpiY = 85;
        const kpiW = 160;
        const kpiH = 58;
        const kpiGap = 12;
        const kpis = [
            { label: "Total Revenue", value: `Rs. ${kpi.totalRevenue.toFixed(2)}` },
            { label: "Total Orders", value: kpi.totalOrders.toString() },
            { label: "Avg. Order Value", value: `Rs. ${avgOV}` },
            { label: "Active Coupons", value: activeCoupons.toString() },
        ];
        kpis.forEach((k, i) => {
            const x = 40 + i * (kpiW + kpiGap);
            doc.roundedRect(x, kpiY, kpiW, kpiH, 6).strokeColor(PRIMARY).lineWidth(1.5).stroke();
            doc.fillColor("#555").fontSize(8).font("Helvetica").text(k.label.toUpperCase(), x + 10, kpiY + 10, { width: kpiW - 20 });
            doc.fillColor("black").fontSize(14).font("Helvetica-Bold").text(k.value, x + 10, kpiY + 24, { width: kpiW - 20 });
        });

        // ── Table ──
        const tableTop = kpiY + kpiH + 20;
        const cols = [
            { header: filter === "custom" ? "Date" : "Period", key: "label", width: 160, align: "left" },
            { header: "Sales Count", key: "salesCount", width: 80, align: "right" },
            { header: "Gross Amount", key: "grossAmount", width: 120, align: "right" },
            { header: "Discounts", key: "totalDiscount", width: 110, align: "right" },
            { header: "Net Revenue", key: "netRevenue", width: 120, align: "right" },
            { header: "Growth", key: "growth", width: 70, align: "right" },
        ];

        // Table header row
        let x = 40;
        const rowH = 22;
        doc.rect(40, tableTop, cols.reduce((s, c) => s + c.width, 0), rowH).fill("#1e293b");
        x = 40;
        cols.forEach(col => {
            doc.fillColor("white").fontSize(8).font("Helvetica-Bold").text(col.header.toUpperCase(), x + 6, tableTop + 7, { width: col.width - 12, align: col.align });
            x += col.width;
        });

        // Data rows
        let rowY = tableTop + rowH;
        rows.forEach((row, ri) => {
            if (rowY > doc.page.height - 60) {
                doc.addPage({ layout: "landscape" });
                rowY = 40;
            }
            const bg = ri % 2 === 0 ? "#f8fafc" : "white";
            const totalW = cols.reduce((s, c) => s + c.width, 0);
            doc.rect(40, rowY, totalW, rowH).fill(bg);

            x = 40;
            const values = [
                row.label,
                row.salesCount.toString(),
                `Rs. ${row.grossAmount.toFixed(2)}`,
                `-Rs. ${row.totalDiscount.toFixed(2)}`,
                `Rs. ${row.netRevenue.toFixed(2)}`,
                row.growth !== null ? `${row.growth >= 0 ? '+' : ''}${row.growth}%` : "—",
            ];
            values.forEach((val, ci) => {
                const col = cols[ci];
                const isRevenue = ci === 4;
                doc.fillColor(isRevenue ? PRIMARY : "#1e293b")
                    .fontSize(8).font(isRevenue ? "Helvetica-Bold" : "Helvetica")
                    .text(val, x + 6, rowY + 7, { width: col.width - 12, align: col.align });
                x += col.width;
            });
            rowY += rowH;
        });

        // Grand Total row
        if (rowY > doc.page.height - 60) { doc.addPage({ layout: "landscape" }); rowY = 40; }
        const totalW = cols.reduce((s, c) => s + c.width, 0);
        doc.rect(40, rowY, totalW, rowH + 2).fill("#0f172a");
        const totValues = [
            filter === "custom" ? "RANGE TOTAL" : "GRAND TOTAL (ALL TIME)",
            tableTotal.salesCount.toString(),
            `Rs. ${tableTotal.grossAmount.toFixed(2)}`,
            `-Rs. ${tableTotal.totalDiscount.toFixed(2)}`,
            `Rs. ${tableTotal.netRevenue.toFixed(2)}`,
            "",
        ];
        x = 40;
        totValues.forEach((val, ci) => {
            const col = cols[ci];
            doc.fillColor(ci === 4 ? "#60a5fa" : "white")
                .fontSize(9).font("Helvetica-Bold")
                .text(val, x + 6, rowY + 7, { width: col.width - 12, align: col.align });
            x += col.width;
        });

        // Footer
        doc.moveDown(3).fillColor("#94a3b8").fontSize(8).font("Helvetica")
            .text(`FootyGear Admin — Confidential · ${generatedAt}`, { align: "center" });

        doc.end();
    } catch (error) {
        console.log("PDF export error:", error);
        res.status(500).send("Failed to generate PDF");
    }
};

// ─── Export Excel ─────────────────────────────────────────────────────────────
export const analyticsExcelExport = async (req, res) => {
    try {
        const filter = req.query.filter || "daily";
        const { startDate, endDate } = req.query;
        const rows = await fetchAllBuckets(filter, startDate, endDate);

        const kpiMatch = { orderStatus: { $nin: ["Cancelled"] } };
        if (startDate || endDate) {
            kpiMatch.orderedAt = {};
            if (startDate) { const s = new Date(startDate); s.setHours(0,0,0,0); kpiMatch.orderedAt.$gte = s; }
            if (endDate)   { const e = new Date(endDate);   e.setHours(23,59,59,999); kpiMatch.orderedAt.$lte = e; }
        }

        const kpiAgg = await Order.aggregate([
            { $match: kpiMatch },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 }, totalDiscount: { $sum: "$discount" } } },
        ]);
        const kpi = kpiAgg[0] || { totalRevenue: 0, totalOrders: 0, totalDiscount: 0 };
        const activeCoupons = await Coupon.countDocuments({ isActive: true });

        const tableTotal = rows.reduce(
            (acc, r) => { acc.salesCount += r.salesCount; acc.grossAmount += r.grossAmount; acc.totalDiscount += r.totalDiscount; acc.netRevenue += r.netRevenue; return acc; },
            { salesCount: 0, grossAmount: 0, totalDiscount: 0, netRevenue: 0 },
        );

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "FootyGear Admin";
        workbook.created = new Date();

        const ws = workbook.addWorksheet("Sales Analytics", {
            pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1 },
        });

        // Column widths
        ws.columns = [
            { key: "label",         width: 28 },
            { key: "salesCount",    width: 14 },
            { key: "grossAmount",   width: 20 },
            { key: "totalDiscount", width: 20 },
            { key: "netRevenue",    width: 20 },
            { key: "growth",        width: 12 },
        ];

        // ── Title block ──
        ws.mergeCells("A1:F1");
        const titleCell = ws.getCell("A1");
        titleCell.value = "FootyGear — Sales Analytics Report";
        titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF137fec" } };
        titleCell.alignment = { vertical: "middle", horizontal: "center" };
        ws.getRow(1).height = 32;

        ws.mergeCells("A2:F2");
        const subCell = ws.getCell("A2");
        const filterLabel = filter === "daily" ? "Daily"
            : filter === "weekly" ? "Weekly"
            : filter === "custom" ? "Custom Range"
            : "Monthly (Yearly)";
        const rangeLabel = filter === "custom" && startDate && endDate
            ? ` (${new Date(startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} – ${new Date(endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})`
            : "";
        subCell.value = `Filter: ${filterLabel}${rangeLabel}   ·   Generated: ${new Date().toLocaleString("en-IN")}`;
        subCell.font = { size: 10, color: { argb: "FF64748b" } };
        subCell.alignment = { horizontal: "center" };
        ws.getRow(2).height = 18;

        // ── KPI Summary ──
        ws.addRow([]);
        const kpiTitleRow = ws.addRow(["KPI Summary"]);
        kpiTitleRow.getCell(1).font = { bold: true, size: 11, color: { argb: "FF137fec" } };

        const kpiHeaders = ws.addRow(["Total Revenue", "Total Orders", "Avg. Order Value", "Active Coupons"]);
        kpiHeaders.eachCell(cell => {
            cell.font = { bold: true, size: 9, color: { argb: "FF94a3b8" } };
            cell.alignment = { horizontal: "center" };
        });

        const kpiValues = ws.addRow([
            kpi.totalRevenue,
            kpi.totalOrders,
            kpi.totalOrders > 0 ? parseFloat((kpi.totalRevenue / kpi.totalOrders).toFixed(2)) : 0,
            activeCoupons,
        ]);
        kpiValues.eachCell((cell, colNum) => {
            cell.font = { bold: true, size: 13 };
            cell.alignment = { horizontal: "center" };
            if (colNum === 1 || colNum === 3) {
                cell.numFmt = '"Rs." #,##0.00';
                cell.font = { bold: true, size: 13, color: { argb: "FF137fec" } };
            }
        });

        ws.addRow([]);

        // ── Table header ──
        const headers = [filter === "custom" ? "Date" : "Period", "Sales Count", "Gross Amount (Rs.)", "Discounts (Rs.)", "Net Revenue (Rs.)", "Growth %"];
        const headerRow = ws.addRow(headers);
        headerRow.eachCell(cell => {
            cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1e293b" } };
            cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
            cell.border = { bottom: { style: "thin", color: { argb: "FF137fec" } } };
        });
        headerRow.height = 20;
        const headerRowNum = ws.rowCount;

        // ── Data rows ──
        rows.forEach((row, ri) => {
            const dataRow = ws.addRow([
                row.label,
                row.salesCount,
                row.grossAmount,
                row.totalDiscount,
                row.netRevenue,
                row.growth !== null ? parseFloat(row.growth) : null,
            ]);

            const bg = ri % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
            dataRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
                if (colNum === 1) { cell.alignment = { horizontal: "left" }; }
                else { cell.alignment = { horizontal: "right" }; }
                if (colNum >= 3 && colNum <= 5) { cell.numFmt = '"Rs." #,##0.00'; }
                if (colNum === 6 && cell.value !== null) {
                    cell.numFmt = '+0.0%;-0.0%;0%';
                    cell.font = { color: { argb: cell.value >= 0 ? "FF0bda5b" : "FFfa6238" } };
                }
                if (colNum === 5) { cell.font = { bold: true, color: { argb: "FF137fec" } }; }
                if (colNum === 4) { cell.font = { color: { argb: "FFef4444" } }; }
            });
        });

        // ── Grand Total row ──
        const totalRow = ws.addRow([
            filter === "custom" ? "RANGE TOTAL" : "GRAND TOTAL (ALL TIME)",
            tableTotal.salesCount,
            tableTotal.grossAmount,
            tableTotal.totalDiscount,
            tableTotal.netRevenue,
            null,
        ]);
        totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
            cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0f172a" } };
            cell.alignment = { horizontal: colNum === 1 ? "left" : "right" };
            if (colNum >= 3 && colNum <= 5) {
                cell.numFmt = '"Rs." #,##0.00';
                if (colNum === 5) cell.font = { bold: true, size: 10, color: { argb: "FF60a5fa" } };
            }
        });
        totalRow.height = 22;

        // Auto-filter on header row
        ws.autoFilter = { from: { row: headerRowNum, column: 1 }, to: { row: headerRowNum, column: 6 } };

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="sales-analytics-${filter}-${Date.now()}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log("Excel export error:", error);
        res.status(500).send("Failed to generate Excel");
    }
};