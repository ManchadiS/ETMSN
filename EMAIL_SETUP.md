# Email Configuration Guide

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Click "Generate"
4. Copy the 16-character password provided

### Step 3: Configure .env File
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=your-email@gmail.com
```

**Note:** Use the 16-character password from App Passwords, not your regular Gmail password.

## Alternative Email Providers

### SendGrid
```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
```

### Outlook/Office 365
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Custom SMTP Server
```env
EMAIL_SERVICE=custom
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_FROM=noreply@yourdomain.com
```

## Test Email Sending

### Via API
```bash
# Create a bill and send email
curl -X POST http://localhost:3000/billing \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "mobile": "9870859624",
    "emailId": "your-test-email@example.com",
    "cgst": 45,
    "sgst": 45,
    "date": "2026-06-19",
    "foodItems": [
      {"name": "Test Item", "price": 500, "quantity": 1, "time": "12:00"}
    ]
  }'
```

### Check Email Status
```bash
curl http://localhost:3000/debug/email-status
```

### View All Sent Emails
```bash
curl http://localhost:3000/debug/email-logs
```

## Troubleshooting

### Email Not Sending?
1. Verify `.env` file has correct credentials
2. Check email status: `curl http://localhost:3000/debug/email-status`
3. Look at server console for error messages
4. For Gmail: Make sure you used the 16-character App Password

### Gmail App Password Issues
- "App not set up properly" → Try regenerating the app password
- "Account not recognized" → Check that 2FA is enabled
- "Invalid credentials" → Verify you copied the full 16-character password without spaces

### Connection Errors
- Check that SMTP_PORT is correct (usually 587 or 465)
- Verify SMTP_SECURE setting (true for port 465, false for 587)
- Check firewall/network settings

## Production Notes

For production use:
1. Store credentials in environment variables (not in .env file)
2. Use strong, unique app passwords
3. Monitor email sending failures
4. Consider rate limiting to avoid spam filters
5. Add proper error handling and retry logic
