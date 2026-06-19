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

  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️  Email credentials not configured in .env file');
    console.warn('   Emails will be logged to console only');
    return null;
  }

  if (emailService === 'gmail') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPassword }
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: emailUser, pass: emailPassword }
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

  return [
    `BILL / INVOICE - ${restaurant && restaurant.name ? restaurant.name : 'Engineering Tadka'}`,
    `Date: ${billing.date || new Date().toISOString().split('T')[0]}`,
    `Time: ${new Date().toLocaleTimeString()}`,
    `Contact: ${billing.mobile || 'N/A'}`,
    '',
    itemsText,
    '',
    `SUBTOTAL: ₹${subtotal.toFixed(2)}`,
    `CGST: ₹${cgst.toFixed(2)}`,
    `SGST: ₹${sgst.toFixed(2)}`,
    `TOTAL: ₹${total.toFixed(2)}`
  ].join('\n');
}

function createBillPdf(billing, restaurant) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const subtotal = billing.amount || 0;
      const cgst = billing.cgst || 0;
      const sgst = billing.sgst || 0;
      const total = subtotal + cgst + sgst;

      // Header
      doc.rect(40, 40, 515, 70).fillAndStroke('#f8f8f8', '#dddddd');
      doc.fillColor('#000').font('Helvetica-Bold').fontSize(20).text(restaurant && restaurant.name ? restaurant.name : 'Engineering Tadka', 50, 50, { align: 'left' });
      doc.font('Helvetica').fontSize(10).text('Contact: 9870859624', 50, 74, { align: 'left' });
      doc.fontSize(10).text(`Date: ${billing.date || new Date().toISOString().split('T')[0]}`, 400, 50, { align: 'left' });
      doc.text(`Time: ${new Date().toLocaleTimeString()}`, 400, 64, { align: 'left' });

      let y = 120;

      // Items table header with fixed columns (removed Time column)
      const cols = { name: 50, qty: 320, price: 410, total: 480 };

      doc.moveTo(45, y - 8).lineTo(555, y - 8).lineWidth(0.5).stroke('#dddddd');
      doc.font('Helvetica-Bold').fontSize(11).text('Item', cols.name, y);
      doc.text('Qty', cols.qty, y, { width: 40, align: 'right' });
      doc.text('Price', cols.price, y, { width: 60, align: 'right' });
      doc.text('Total', cols.total, y, { width: 70, align: 'right' });
      y += 22;

      doc.font('Helvetica').fontSize(10);
      const lineHeight = 18;
      const items = Array.isArray(billing.foodItems) && billing.foodItems.length ? billing.foodItems : [];
      if (items.length) {
        items.forEach(item => {
          const qty = item.quantity || 1;
          const price = Number(item.price || 0);
          const itemTotal = (price * qty).toFixed(2);

          const nameOptions = { width: cols.qty - cols.name - 12 };
          doc.text(item.name, cols.name, y, nameOptions);
          doc.text(String(qty), cols.qty, y, { width: 40, align: 'right' });
          doc.text(`₹${price.toFixed(2)}`, cols.price, y, { width: 60, align: 'right' });
          doc.text(`₹${itemTotal}`, cols.total, y, { width: 70, align: 'right' });

          y += lineHeight;
          if (y > 720) { doc.addPage(); y = 50; }
        });
      } else {
        doc.text('No items', cols.name, y);
        y += lineHeight;
      }

      // Draw simple table borders
      try {
        const tableTop = 118;
        const headerHeight = 22;
        const rows = Math.max(items.length, 1);
        const tableBottom = tableTop + headerHeight + rows * lineHeight + 6;

        doc.lineWidth(0.8).strokeColor('#cccccc');
        doc.rect(45, tableTop - 10, 510, tableBottom - tableTop + 10).stroke();
        doc.moveTo(45, tableTop + headerHeight - 6).lineTo(555, tableTop + headerHeight - 6).stroke();

        // Column separators (no Time column)
        const colXs = [cols.qty - 8, cols.price - 8, cols.total - 6];
        colXs.forEach(x => { doc.moveTo(x, tableTop - 10).lineTo(x, tableBottom + 10).stroke(); });
      } catch (e) {
        // ignore
      }

      // Totals block
      y += 10;
      const totalsX = 420;
      const labelW = 80;
      const valueW = 100;
      doc.font('Helvetica').fontSize(10);
      doc.text('SUBTOTAL', totalsX, y, { width: labelW });
      doc.text(`₹${subtotal.toFixed(2)}`, totalsX + labelW, y, { width: valueW, align: 'right' });
      y += 16;
      doc.text('CGST', totalsX, y, { width: labelW });
      doc.text(`₹${cgst.toFixed(2)}`, totalsX + labelW, y, { width: valueW, align: 'right' });
      y += 16;
      doc.text('SGST', totalsX, y, { width: labelW });
      doc.text(`₹${sgst.toFixed(2)}`, totalsX + labelW, y, { width: valueW, align: 'right' });
      y += 18;
      doc.moveTo(totalsX, y).lineTo(totalsX + labelW + valueW, y).stroke('#cccccc');
      y += 6;
      doc.font('Helvetica-Bold').fontSize(12).text('TOTAL', totalsX, y, { width: labelW });
      doc.text(`₹${total.toFixed(2)}`, totalsX + labelW, y, { width: valueW, align: 'right' });

      // Footer
      doc.font('Helvetica').fontSize(10).text(`Payment Mode: ${billing.paymentMode || 'Cash'}`, 50, y + 36);
      doc.text(`Status: ${(billing.status || 'pending').toUpperCase()}`, 50, y + 52);
      if (billing.description) doc.text(`Notes: ${billing.description}`, 50, y + 68);
      doc.fontSize(9).fillColor('#666666').text('Thank you for dining with us!', 50, y + 96, { align: 'center', width: 500 });

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
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: emailId,
        subject: emailRecord.subject,
        text: bill,
        html: `<pre>${bill.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`,
        attachments: [
          {
            filename: `bill-${billing.id || 'receipt'}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
            contentDisposition: 'attachment'
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
      console.log(`\n📧 Bill logged (email not sent):\n${bill}`);
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
