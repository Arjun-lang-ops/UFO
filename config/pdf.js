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

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderNumber}.pdf`
    );

    doc.pipe(res);

    /* =========================
       HEADER
    ========================= */

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("URBAN FOOTBALL", 40, 40);

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
        { align: "right" }
      );

    /* =========================
       SHIPPING ADDRESS
    ========================= */

    doc
      .moveDown(3)
      .font("Helvetica-Bold")
      .text("Shipping Address", 40, 140);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(order.address.fullname)
      .text(order.address.apartment || "")
      .text(
        `${order.address.street}, ${order.address.state} - ${order.address.pincode}`
      )
      .text(`Phone: ${order.address.phone}`);

    /* =========================
       TABLE HEADER
    ========================= */

    const tableTop = 260;

    const drawRow = (y, item, qty, price, total, bold = false) => {
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(11);

      doc.text(item, 45, y, { width: 250 });
      doc.text(qty, 330, y, { width: 50, align: "center" });
      doc.text(`₹${price}`, 390, y, {
        width: 70,
        align: "right",
      });
      doc.text(`₹${total}`, 470, y, {
        width: 80,
        align: "right",
      });

      doc.moveTo(40, y + 20).lineTo(555, y + 20).strokeColor("#ddd").stroke();
    };

    // table heading background
    doc
      .rect(40, tableTop - 8, 515, 25)
      .fill("#f5f5f5");

    doc.fillColor("black");

    drawRow(
      tableTop,
      "Item",
      "Qty",
      "Price",
      "Total",
      true
    );

    /* =========================
       ITEMS
    ========================= */

    let rowY = tableTop + 30;

    order.items.forEach((item) => {
      drawRow(
        rowY,
        item.product.name,
        item.quantity,
        item.price,
        item.quantity * item.price
      );

      rowY += 30;
    });

    /* =========================
       TOTALS
    ========================= */

    rowY += 25;

    const subtotal = order.subtotal || order.totalAmount;
    const discount = order.discount || 0;
    const shipping = order.shippingCharge || 0;

    const totalsX = 390;

    doc
      .font("Helvetica")
      .text("Subtotal:", totalsX, rowY)
      .text(`₹${subtotal}`, 470, rowY, {
        width: 80,
        align: "right",
      });

    rowY += 20;

    doc
      .text("Discount:", totalsX, rowY)
      .text(`- ₹${discount}`, 470, rowY, {
        width: 80,
        align: "right",
      });

    rowY += 20;

    doc
      .text("Shipping:", totalsX, rowY)
      .text(`₹${shipping}`, 470, rowY, {
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
      .text(`₹${order.finalAmount}`, 470, rowY, {
        width: 80,
        align: "right",
      });

    /* =========================
       FOOTER
    ========================= */

    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor("gray")
      .text(
        "This is a computer-generated invoice.",
        40,
        760,
        {
          align: "center",
          width: 515,
        }
      );

    doc.end();
  } catch (error) {
    console.error(error);
    res.redirect("/orderHistory");
  }
};