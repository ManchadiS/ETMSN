async function sendBillSms(billing, restaurant, mobile) {
  const apiKey = process.env.FAST2SMS_API_KEY // API Key

  if (!mobile) {
    return { success: false, error: 'No mobile number provided' };
  }

  // Clean the mobile number to ensure it has 10 digits
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  if (cleanMobile.length !== 10) {
    return { success: false, error: 'Invalid 10-digit mobile number' };
  }

  const orderNo = billing.orderNumber || 'N/A';
  // Construct the hosted public invoice URL
  const serverUrl = process.env.SERVER_URL;
  const billLink = `${serverUrl}/api/v1/billing/${billing.id || billing._id}/view`;

  const messageText = `Your food bill with order number #${orderNo} is ready. You can view your bill here: ${billLink}`;

  console.log(`Sending SMS to ${cleanMobile}...`);
  console.log(`SMS Content: "${messageText}"`);

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q',
        message: messageText,
        language: 'english',
        flash: 0,
        numbers: cleanMobile
      })
    });

    const data = await response.json();
    console.log('Fast2SMS response:', data);
    if (data && data.return === true) {
      return { success: true, data };
    } else {
      return { success: false, error: data?.message || 'Fast2SMS returned failure' };
    }
  } catch (err) {
    console.error('Fast2SMS error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendBillSms
};
