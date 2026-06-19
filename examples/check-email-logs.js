#!/usr/bin/env node
/**
 * Example: Create a Bill and View Email Logs
 * 
 * This shows how to:
 * 1. Create a bill with email
 * 2. Retrieve the formatted bill from email logs
 * 3. View all sent bills
 */

const http = require('http');

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('          BILL CREATION & EMAIL LOG TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Create a bill
    console.log('📝 Step 1: Creating bill with email...\n');
    const billData = {
      amount: 450,
      restaurantId: null,
      date: '2026-06-19',
      description: 'Dinner - Table 05',
      status: 'pending',
      mobile: '9870859624',
      emailId: 'customer@example.com',
      cgst: 40.50,
      sgst: 40.50,
      foodItems: [
        { name: 'Engineering Tadka Special', price: 280, quantity: 1, time: '19:00' },
        { name: 'Garlic Naan', price: 50, quantity: 2, time: '19:05' },
        { name: 'Mango Lassi', price: 40, quantity: 1, time: '19:00' }
      ]
    };

    const billResponse = await makeRequest('POST', '/billing', billData);
    console.log('✅ Bill Created:');
    console.log(`   ID: ${billResponse.id}`);
    console.log(`   Amount: ₹${billResponse.amount}`);
    console.log(`   Email: ${billResponse.emailId}`);
    console.log(`   Items: ${billResponse.foodItems?.length || 0}\n`);

    // Step 2: Get email logs
    console.log('─────────────────────────────────────────────────────────────');
    console.log('\n📧 Step 2: Retrieving email logs...\n');

    const emailLogs = await makeRequest('GET', '/debug/email-logs', null);
    console.log(`✅ Total emails sent: ${emailLogs.total}\n`);

    if (emailLogs.emails && emailLogs.emails.length > 0) {
      const lastEmail = emailLogs.emails[emailLogs.emails.length - 1];
      console.log('📧 Latest Email:');
      console.log(`   To: ${lastEmail.to}`);
      console.log(`   Subject: ${lastEmail.subject}`);
      console.log(`   Timestamp: ${lastEmail.timestamp}\n`);

      console.log('📄 Bill Summary:');
      console.log(`   Total: ₹${lastEmail.billData.total}`);
      console.log(`   Items: ${lastEmail.billData.itemCount}`);
      console.log(`   Status: ${lastEmail.billData.status}\n`);

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('          FORMATTED BILL SENT TO EMAIL');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(lastEmail.billFormat);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
