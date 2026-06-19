#!/usr/bin/env node
/**
 * Example: Creating a Bill with Email and Food Items
 * 
 * This example demonstrates how to create a bill with:
 * - Mobile number
 * - Email ID (bill will be sent via email)
 * - Food items with times
 * - CGST and SGST calculations
 */

const http = require('http');

const billData = {
  amount: 540,
  restaurantId: null,
  date: '2026-06-19',
  description: 'Dinner - Table 09',
  status: 'pending',
  mobile: '9870859624',
  emailId: 'customer@example.com',
  cgst: 54,  // 10% CGST
  sgst: 54,  // 10% SGST
  paymentMode: 'cash',
  foodItems: [
    { name: 'Engineering Tadka Biryani', price: 250, quantity: 1, time: '19:00' },
    { name: 'Butter Naan', price: 60, quantity: 2, time: '19:05' },
    { name: 'Dal Makhani', price: 120, quantity: 1, time: '19:05' },
    { name: 'Raita', price: 50, quantity: 1, time: '19:05' }
  ]
};

function sendRequest() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/billing',
    method: 'POST',
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
      console.log('Response Status:', res.statusCode);
      console.log('Bill Created:', JSON.parse(data));
      console.log('\n✅ Bill sent to:', billData.emailId);
      console.log('📱 Contact:', billData.mobile);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(JSON.stringify(billData));
  req.end();
}

console.log('Creating bill with email notification...');
console.log('Bill Amount:', billData.amount);
console.log('CGST:', billData.cgst);
console.log('SGST:', billData.sgst);
console.log('Total:', billData.amount + billData.cgst + billData.sgst);
console.log('\nSending request to http://localhost:3000/billing...\n');

sendRequest();
