# Billing Feature Guide

## Overview
The billing module in the Restaurant Management System generates detailed bills with support for:
- Mobile number and email address capture
- Multiple food items with quantity and time
- CGST (Central Goods and Services Tax) calculations
- SGST (State Goods and Services Tax) calculations
- Automatic email delivery of formatted bills
- Payment status tracking

## Create a Bill with Email Notification

### Basic Request

```json
POST /billing
{
  "amount": 540,
  "restaurantId": null,
  "date": "2026-06-19",
  "description": "Dinner - Table 09",
  "status": "pending",
  "mobile": "9870859624",
  "emailId": "customer@example.com",
  "cgst": 54,
  "sgst": 54,
  "foodItems": [
    {
      "name": "Biryani",
      "price": 250,
      "quantity": 1,
      "time": "19:00"
    },
    {
      "name": "Butter Naan",
      "price": 60,
      "quantity": 2,
      "time": "19:05"
    },
    {
      "name": "Dal Makhani",
      "price": 120,
      "quantity": 1,
      "time": "19:05"
    }
  ]
}
```

### Response

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "amount": 540,
  "restaurantId": null,
  "date": "2026-06-19",
  "description": "Dinner - Table 09",
  "status": "pending",
  "mobile": "9870859624",
  "emailId": "customer@example.com",
  "cgst": 54,
  "sgst": 54,
  "foodItems": [
    {
      "name": "Biryani",
      "price": 250,
      "quantity": 1,
      "time": "19:00"
    },
    {
      "name": "Butter Naan",
      "price": 60,
      "quantity": 2,
      "time": "19:05"
    },
    {
      "name": "Dal Makhani",
      "price": 120,
      "quantity": 1,
      "time": "19:05"
    }
  ]
}
```

## Bill Format Example

When a bill is created with an email address, it's automatically formatted and sent as follows:

```
╔══════════════════════════════════════════════╗
║      Engineering Tadka                       ║
║         BILL / INVOICE                       ║
╚══════════════════════════════════════════════╝

Date: 2026-06-19
Time: 19:30:45
Contact: 9870859624

─────────────────────────────────────────────
Item Details:
─────────────────────────────────────────────
Biryani                                ₹250.00
Butter Naan                            ₹60.00
Dal Makhani                            ₹120.00
Raita                                  ₹50.00

─────────────────────────────────────────────
SUBTOTAL:                      ₹480.00
CGST (10%):                    ₹48.00
SGST (10%):                    ₹48.00
─────────────────────────────────────────────
TOTAL:                         ₹576.00
─────────────────────────────────────────────

Payment Mode: cash
Status: PENDING

Notes: Dinner - Table 09

           THANK YOU FOR YOUR VISIT!
            PLEASE VISIT US AGAIN
```

## Field Descriptions

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| amount | number | Total bill amount (before taxes) | ✓ |
| restaurantId | string | UUID of the restaurant | ✗ |
| date | string | Date of the transaction (YYYY-MM-DD) | ✗ |
| description | string | Bill description/notes | ✗ |
| status | string | Billing status (pending, paid, overdue) | ✗ |
| mobile | string | Customer mobile number | ✗ |
| emailId | string | Customer email address | ✗ |
| cgst | number | Central GST amount | ✗ |
| sgst | number | State GST amount | ✗ |
| foodItems | array | Array of food items ordered | ✗ |

## Food Items Format

Each food item in the `foodItems` array should have:

```json
{
  "name": "string",      // Item name
  "price": "number",     // Price per unit
  "quantity": "number",  // Quantity ordered
  "time": "string"       // Time when served (HH:MM format)
}
```

## API Endpoints

### Create a Bill
```
POST /billing
Body: Bill object (see above)
Response: 201 Created
```

### Get All Bills
```
GET /billing
Response: 200 OK with array of bills
```

### Get a Specific Bill
```
GET /billing/{id}
Response: 200 OK
```

### Update a Bill
```
PUT /billing/{id}
Body: Partial bill object (any fields to update)
Response: 200 OK
```

### Delete a Bill
```
DELETE /billing/{id}
Response: 204 No Content
```

## Email Configuration

Currently, the system uses a mock email service that logs bills to the console. To enable actual email sending:

1. Install nodemailer:
```bash
npm install nodemailer
```

2. Update `src/services/emailService.js` with your email provider credentials:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

3. Add environment variables to `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Testing

Run the example with:
```bash
node examples/create-bill-with-email.js
```

Or use the Swagger UI at `http://localhost:3000/docs` to test the billing endpoints directly.
