import PDFDocument from "pdfkit";
import { orderDetailsService } from "../service/adminOrderService.js";

export const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.session.user || req.session.userId || req.user?._id;

    const order = await orderDetailsService(orderId, userId);

    if (!order) return res.redirect("/orderHistory");

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    const currency = (amount) =>
      `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
    const cancelledStatuses = ["Approved", "Cancelled", "Refunded"];
    const returnedStatuses = ["Approved", "Returned", "Refunded"];
    const getItemStatus = (item) => {
      if (
        order.orderStatus === "Cancelled" ||
        (item.cancelRequest && cancelledStatuses.includes(item.cancelStatus))
      ) {
        return "Cancelled";
      }

      if (
        order.orderStatus === "Returned" ||
        (item.returnRequest && returnedStatuses.includes(item.returnStatus))
      ) {
        return "Returned";
      }

      return "";
    };
    const getExcludedQuantity = (item, status) => {
      if (!["Cancelled", "Returned"].includes(status)) {
        return 0;
      }

      if (
        order.orderStatus === "Cancelled" ||
        order.orderStatus === "Returned"
      ) {
        return Number(item.quantity || 0);
      }

      return status === "Cancelled"
        ? Number(item.cancelQuantity || item.quantity || 0)
        : Number(item.returnQuantity || item.quantity || 0);
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderNumber}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(22).font("Helvetica-Bold").text("URBAN FOOTBALL", 40, 40);

    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("gray")
      .text("Premium Football Store", 40, 68);

    doc
      .fillColor("black")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("TAX INVOICE", 400, 40, { align: "right" });

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Order No: ${order.orderNumber}`, 400, 75, {
        align: "right",
      })
      .text(
        `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
        400,
        92,
        { align: "right" },
      );

    doc.moveDown(3).font("Helvetica-Bold").text("Shipping Address", 40, 140);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(order.address.fullname)
      .text(order.address.apartment || "")
      .text(
        `${order.address.street}, ${order.address.state} - ${order.address.pincode}`,
      )
      .text(`Phone: ${order.address.phone}`);

    const tableTop = 260;

    const drawRow = (y, item, qty, price, total, status = "", bold = false) => {
      const isInactive = ["Cancelled", "Returned"].includes(status);

      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(10)
        .fillColor(isInactive ? "#9f1239" : "black");

      doc.text(item, 45, y, { width: 210 });
      doc.text(qty, 270, y, { width: 45, align: "center" });
      doc.text(bold ? price : currency(price), 325, y, {
        width: 70,
        align: "right",
      });
      doc.text(bold ? total : currency(total), 405, y, {
        width: 70,
        align: "right",
      });
      doc.text(status || "-", 490, y, {
        width: 60,
        align: "right",
      });

      if (isInactive) {
        doc
          .moveTo(45, y + 8)
          .lineTo(555, y + 8)
          .strokeColor("#dc2626")
          .lineWidth(1.5)
          .stroke()
          .lineWidth(1);
      }

      doc
        .moveTo(40, y + 20)
        .lineTo(555, y + 20)
        .strokeColor("#ddd")
        .stroke();
      doc.fillColor("black");
    };

    doc.rect(40, tableTop - 8, 515, 25).fill("#f5f5f5");
    doc.fillColor("black");

    drawRow(tableTop, "Item", "Qty", "Price", "Total", "Status", true);

    let rowY = tableTop + 30;
    let excludedItemsTotal = 0;

    order.items.forEach((item) => {
      const itemStatus = getItemStatus(item);
      const lineTotal = Number(
        item.totalPrice || item.quantity * item.price || 0,
      );
      const excludedQuantity = getExcludedQuantity(item, itemStatus);

      if (["Cancelled", "Returned"].includes(itemStatus)) {
        excludedItemsTotal += Number(item.price || 0) * excludedQuantity;
      }

      drawRow(
        rowY,
        item.product?.name || "Product unavailable",
        item.quantity,
        item.price,
        lineTotal,
        itemStatus,
      );

      rowY += 30;
    });

    rowY += 25;

    const subtotal = Number(order.subTotal || 0);
    const discount = Number(order.discount || 0);
    const shipping = Number(order.deliveryCharge ?? order.shippingCharge ?? 0);
    const originalGrandTotal = Number(
      order.finalAmount ?? order.totalAmount ?? subtotal - discount + shipping,
    );
    const grandTotal = Math.max(0, originalGrandTotal - excludedItemsTotal);
    const totalsX = 390;

    doc
      .font("Helvetica")
      .fontSize(11)
      .text("Subtotal:", totalsX, rowY)
      .text(currency(subtotal), 470, rowY, {
        width: 80,
        align: "right",
      });

    rowY += 20;

    if (excludedItemsTotal > 0) {
      doc
        .fillColor("#dc2626")
        .text("Cancelled/Returned:", totalsX, rowY)
        .text(`- ${currency(excludedItemsTotal)}`, 470, rowY, {
          width: 80,
          align: "right",
        })
        .fillColor("black");

      rowY += 20;
    }

    doc
      .text("Discount:", totalsX, rowY)
      .text(`- ${currency(discount)}`, 470, rowY, {
        width: 80,
        align: "right",
      });

    rowY += 20;

    doc.text("Shipping:", totalsX, rowY).text(currency(shipping), 470, rowY, {
      width: 80,
      align: "right",
    });

    rowY += 28;

    doc
      .moveTo(390, rowY - 8)
      .lineTo(555, rowY - 8)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text("Grand Total:", totalsX, rowY)
      .text(currency(grandTotal), 470, rowY, {
        width: 80,
        align: "right",
      });

    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor("gray")
      .text("This is a computer-generated invoice.", 40, 760, {
        align: "center",
        width: 515,
      });

    doc.end();
  } catch (error) {
    console.error(error);
    res.redirect("/orderHistory");
  }
};
