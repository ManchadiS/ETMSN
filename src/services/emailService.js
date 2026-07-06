// Email service with nodemailer integration
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const emailLogs = [];

// Create email transporter
let transporter = null;

function initializeTransporter() {
  if (transporter) return transporter;

  // Do not initialize real transporter during test runs
  if (process.env.NODE_ENV === 'test') {
    console.log('⚠️  Test environment: email transporter disabled');
    return null;
  }

  const emailService = (process.env.EMAIL_SERVICE || 'gmail').toLowerCase();
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPassword = (process.env.EMAIL_PASSWORD || '').replace(/\s/g, '');

  if (!emailUser || !emailPassword) {
    console.warn('⚠️  Email credentials not configured in .env file');
    console.warn('   Emails will be logged to console only');
    return null;
  }

  const auth = { user: emailUser, pass: emailPassword };

  if (emailService === 'gmail') {
    transporter = nodemailer.createTransport({ service: 'gmail', auth });
  } else if (emailService === 'outlook' || emailService === 'hotmail') {
    transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth
    });
  } else {
    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost) {
      console.warn('⚠️  SMTP_HOST is required for custom email service');
      console.warn('   Emails will be logged to console only');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth
    });
  }

  console.log('✅ Email transporter initialized:', emailService);
  return transporter;

}

function formatBill(billing, restaurant) {
  const subtotal = billing.amount || 0;
  const cgst = billing.cgst || 0;
  const sgst = billing.sgst || 0;
  const total = subtotal + cgst + sgst;

  const itemsText = (billing.foodItems || []).map(item => {
    const qty = item.quantity || 1;
    const itemTotal = ((item.price || 0) * qty).toFixed(2);
    const time = item.time ? ` (${item.time})` : '';
    return `${item.name} x${qty} ₹${itemTotal}${time}`;
  }).join('\n') || 'No items';

  const discountPercent = Number(billing.discount || 0);
  const itemsTotal = discountPercent > 0 ? (total / (1 - discountPercent / 100)) : total;
  const discountAmount = itemsTotal - total;

  const billLines = [
    `BILL / INVOICE - ${restaurant && restaurant.name ? restaurant.name : 'Engineering Tadka'}`,
  ];
  if (billing.orderNumber) {
    billLines.push(`Order Number: #${billing.orderNumber}`);
  }
  billLines.push(
    `Date: ${billing.date || new Date().toISOString().split('T')[0]}`,
    `Time: ${new Date().toLocaleTimeString()}`,
    `Contact: ${billing.mobile || 'N/A'}`,
    '',
    itemsText,
    ''
  );

  if (discountPercent > 0) {
    billLines.push(`ITEMS TOTAL: ₹${itemsTotal.toFixed(2)}`);
    billLines.push(`DISCOUNT (${discountPercent}%): -₹${discountAmount.toFixed(2)}`);
  }

  billLines.push(
    `SUBTOTAL: ₹${subtotal.toFixed(2)}`,
    `CGST: ₹${cgst.toFixed(2)}`,
    `SGST: ₹${sgst.toFixed(2)}`,
    `TOTAL: ₹${total.toFixed(2)}`,
    '',
    `Note: Prices are inclusive of GST.`
  );
  return billLines.join('\n');
}

function formatCurrency(amount) {
  return `Rs. ${Number(amount).toFixed(2)}`;
}

function createBillPdf(billing, restaurant) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const margin = 50;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - margin * 2;
    const rightEdge = margin + contentWidth;

    const restaurantName = (restaurant && restaurant.name) ? restaurant.name : 'Engineering Tadka';
    const subtotal = Number(billing.amount || 0);
    const cgst = Number(billing.cgst || 0);
    const sgst = Number(billing.sgst || 0);
    const total = subtotal + cgst + sgst;
    const billDate = billing.date || new Date().toISOString().split('T')[0];
    const billTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const colors = {
      primary: '#1a1a2e',
      accent: '#e74c3c',
      muted: '#666666',
      lightBg: '#f4f4f4',
      border: '#cccccc',
      white: '#ffffff'
    };

    let y = margin;

    // Header
    doc.rect(margin, y, contentWidth, 56).fill(colors.primary);
    doc.fillColor(colors.white).font('Helvetica-Bold').fontSize(20)
      .text(restaurantName, margin + 16, y + 14, { width: contentWidth - 32 });
    doc.font('Helvetica').fontSize(10)
      .text(`Contact: ${billing.mobile || '9870859624'}`, margin + 16, y + 38);
    doc.text(`Date: ${billDate}`, margin + contentWidth - 120, y + 16, { width: 104, align: 'right' });
    doc.text(`Time: ${billTime}`, margin + contentWidth - 120, y + 30, { width: 104, align: 'right' });

    y += 72;

    const invoiceTitle = billing.orderNumber ? `TAX INVOICE (Order #${billing.orderNumber})` : 'TAX INVOICE';
    doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(13).text(invoiceTitle, margin, y);
    y += 22;

    const col = {
      itemX: margin,
      itemW: contentWidth * 0.48,
      qtyX: margin + contentWidth * 0.48,
      qtyW: contentWidth * 0.10,
      priceX: margin + contentWidth * 0.58,
      priceW: contentWidth * 0.21,
      totalX: margin + contentWidth * 0.79,
      totalW: contentWidth * 0.21
    };

    const rowPad = 8;
    const headerHeight = 26;
    const tableTop = y;

    doc.rect(margin, tableTop, contentWidth, headerHeight).fill(colors.lightBg);
    doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(10);
    doc.text('Item', col.itemX + 10, tableTop + rowPad, { width: col.itemW - 16 });
    doc.text('Qty', col.qtyX, tableTop + rowPad, { width: col.qtyW, align: 'center' });
    doc.text('Price', col.priceX, tableTop + rowPad, { width: col.priceW - 8, align: 'right' });
    doc.text('Total', col.totalX, tableTop + rowPad, { width: col.totalW - 8, align: 'right' });

    y = tableTop + headerHeight;
    doc.font('Helvetica').fontSize(10).fillColor('#222222');

    const items = Array.isArray(billing.foodItems) && billing.foodItems.length ? billing.foodItems : [];

    const drawRowLine = (rowY, rowHeight) => {
      doc.strokeColor(colors.border).lineWidth(0.5)
        .moveTo(margin, rowY + rowHeight).lineTo(rightEdge, rowY + rowHeight).stroke();
    };

    if (!items.length) {
      const rowHeight = 26;
      doc.text('No items', col.itemX + 10, y + rowPad, { width: col.itemW - 16 });
      drawRowLine(y, rowHeight);
      y += rowHeight;
    } else {
      items.forEach((item, index) => {
        const qty = item.quantity || 1;
        const price = Number(item.price || 0);
        const itemTotal = price * qty;
        const nameHeight = doc.heightOfString(item.name, { width: col.itemW - 16, fontSize: 10 });
        const rowHeight = Math.max(26, nameHeight + rowPad * 2);

        if (y + rowHeight > doc.page.height - 140) {
          doc.addPage();
          y = margin;
        }

        if (index % 2 === 1) {
          doc.rect(margin, y, contentWidth, rowHeight).fill('#fafafa');
          doc.fillColor('#222222');
        }

        doc.text(item.name, col.itemX + 10, y + rowPad, { width: col.itemW - 16 });
        doc.text(String(qty), col.qtyX, y + rowPad, { width: col.qtyW, align: 'center' });
        doc.text(formatCurrency(price), col.priceX, y + rowPad, { width: col.priceW - 8, align: 'right' });
        doc.text(formatCurrency(itemTotal), col.totalX, y + rowPad, { width: col.totalW - 8, align: 'right' });

        drawRowLine(y, rowHeight);
        y += rowHeight;
      });
    }

    const tableBottom = y;

    doc.strokeColor(colors.border).lineWidth(0.8);
    doc.rect(margin, tableTop, contentWidth, tableBottom - tableTop).stroke();
    [col.qtyX, col.priceX, col.totalX].forEach(x => {
      doc.moveTo(x, tableTop).lineTo(x, tableBottom).stroke();
    });

    y += 18;

    const labelWidth = 80;
    const valueWidth = 90;
    const totalsX = rightEdge - labelWidth - valueWidth;

    const drawTotalRow = (label, value, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(bold ? 12 : 10)
        .fillColor(bold ? colors.primary : '#222222');
      doc.text(label, totalsX, y, { width: labelWidth });
      doc.text(formatCurrency(value), totalsX + labelWidth, y, { width: valueWidth, align: 'right' });
      y += bold ? 22 : 18;
    };

    const discountPercent = Number(billing.discount || 0);
    const itemsTotal = discountPercent > 0 ? (total / (1 - discountPercent / 100)) : total;
    const discountAmount = itemsTotal - total;

    if (discountPercent > 0) {
      drawTotalRow('Items Total', itemsTotal);
      const drawTotalRowWithNegative = (label, value) => {
        doc.font('Helvetica')
          .fontSize(10)
          .fillColor('#ef4444');
        doc.text(label, totalsX, y, { width: labelWidth });
        doc.text(`-Rs. ${Number(value).toFixed(2)}`, totalsX + labelWidth, y, { width: valueWidth, align: 'right' });
        y += 18;
      };
      drawTotalRowWithNegative(`Discount (${discountPercent}%)`, discountAmount);
    }

    drawTotalRow('Subtotal', subtotal);
    drawTotalRow('CGST', cgst);
    drawTotalRow('SGST', sgst);
    doc.strokeColor(colors.border).lineWidth(0.5)
      .moveTo(totalsX, y - 4).lineTo(rightEdge, y - 4).stroke();
    drawTotalRow('TOTAL', total, true);

    doc.font('Helvetica-Oblique').fontSize(8).fillColor('#64748b')
      .text('(Prices are inclusive of GST)', totalsX, y, { width: labelWidth + valueWidth, align: 'right' });

    y += 24;

    const infoBoxHeight = billing.description ? 58 : 44;
    doc.rect(margin, y, contentWidth * 0.55, infoBoxHeight).stroke(colors.border);
    doc.font('Helvetica').fontSize(10).fillColor('#222222');
    doc.text(`Payment Mode: ${billing.paymentMode || 'Cash'}`, margin + 12, y + 12);
    doc.text(`Status: ${(billing.status || 'pending').toUpperCase()}`, margin + 12, y + 28);
    if (billing.description) {
      doc.fontSize(9).fillColor(colors.muted)
        .text(`Notes: ${billing.description}`, margin + 12, y + 42, { width: contentWidth * 0.55 - 24 });
    }

    y += infoBoxHeight + 24;
    doc.font('Helvetica').fontSize(10).fillColor(colors.muted)
      .text('Thank you for dining with us!', margin, y, { width: contentWidth, align: 'center' });

    doc.end();
  });
}

async function sendBill(billing, restaurant, emailId) {
  const bill = formatBill(billing, restaurant);
  const transporter = initializeTransporter();
  
  const emailRecord = {
    id: emailId,
    timestamp: new Date().toISOString(),
    to: emailId,
    subject: `Bill Receipt - ${restaurant?.name || 'Engineering Tadka'}`,
    billFormat: bill,
    billData: {
      billId: billing.id,
      amount: billing.amount,
      cgst: billing.cgst,
      sgst: billing.sgst,
      total: (billing.amount || 0) + (billing.cgst || 0) + (billing.sgst || 0),
      itemCount: billing.foodItems?.length || 0,
      status: billing.status,
      date: billing.date,
      contact: billing.mobile
    },
    status: 'pending'
  };

  try {
    if (transporter && process.env.NODE_ENV !== 'test') {
      const pdfBuffer = await createBillPdf(billing, restaurant);
      // Send actual email via nodemailer with PDF attachment
      const mailResult = await transporter.sendMail({
        from: (process.env.EMAIL_FROM || process.env.EMAIL_USER || '').trim(),
        to: emailId,
        subject: emailRecord.subject,
        attachments: [
          {
            filename: `bill-${billing.id || 'receipt'}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });
      emailRecord.status = 'sent';
      emailRecord.mailResult = mailResult;
      console.log(`\n✅ Email sent successfully to: ${emailId}`);
      console.log('   Mail response:', mailResult);
    } else {
      // In test mode or no transporter configured, do not perform network send.
      const pdfBuffer = await createBillPdf(billing, restaurant);
      // Attach the PDF to the log so tests can verify existence
      emailRecord.attachment = { filename: `bill-${billing.id || 'receipt'}.pdf`, size: pdfBuffer.length };
      console.log(`\n📧 Bill PDF generated (email not sent) for: ${emailId}`);
      emailRecord.status = 'logged';
    }
  } catch (err) {
    console.error(`❌ Email send failed for ${emailId}:`, err.message);
    emailRecord.status = 'failed';
    emailRecord.error = err.message;
  }

  emailLogs.push(emailRecord);
  return { success: emailRecord.status !== 'failed', message: `Bill ${emailRecord.status} for ${emailId}`, record: emailRecord };
}

function getEmailLogs() {
  return emailLogs;
}

module.exports = {
  formatBill,
  sendBill,
  getEmailLogs,
};
