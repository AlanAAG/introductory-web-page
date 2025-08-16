# Gmail App Password Setup (100% Free & Simple!)

This guide shows you how to set up Gmail app passwords for automated emails - completely free and much simpler than OAuth!

## 🆓 **Why This Approach?**

- ✅ **Completely free** - no Google Cloud costs
- ✅ **Simple setup** - just 2 environment variables
- ✅ **No quotas** - use your regular Gmail sending limits
- ✅ **No API keys** - uses your Gmail account directly

## 🔧 **Step 1: Enable 2-Factor Authentication**

App passwords require 2FA to be enabled on your Gmail account.

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click "2-Step Verification"
3. Follow the setup process if not already enabled

## 🔑 **Step 2: Generate App Password**

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click "App passwords"
3. Select "Mail" as the app
4. Select "Other (Custom name)" as device
5. Enter: "Website Contact Form" 
6. Click "Generate"
7. **Copy the 16-character password** (you'll need this!)

## 🔐 **Step 3: Set Environment Variables**

Add these to your Render dashboard (Environment tab):

```bash
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcd-efgh-ijkl-mnop
```

### Variable Details:

- **GMAIL_USER**: Your Gmail address (the "from" address)
- **GMAIL_APP_PASSWORD**: The 16-character password from step 2

## ✅ **Step 4: Test Configuration**

1. Deploy your updated webhook server
2. Visit: `https://your-webhook-url.com/test-email`
3. Should return: `{"status": "Email service configured correctly"}`

## 🚀 **Step 5: Test Complete Flow**

1. Submit your contact form
2. Check that:
   - ✅ Form data is saved to Notion
   - ✅ Thank-you email is sent to submitter
   - ✅ You receive the original notification email

## 📧 **What Users Will Receive**

A professional thank-you email with:
- Personal greeting with their name
- Confirmation their message was received
- Your branding and contact info
- Links to your social profiles
- Professional HTML design

## 🔍 **Troubleshooting**

### Common Issues:

**"Invalid login"**
- Ensure 2FA is enabled on your Gmail
- Double-check the app password (no spaces/dashes)
- Verify GMAIL_USER is correct

**"Authentication failed"**
- Re-generate the app password
- Make sure you're using the app password, not your regular password

**"Access denied"**
- Check that 2FA is properly set up
- Try generating a new app password

### Debug Steps:

1. Check environment variables: `GET /test-email`
2. Verify 2FA is enabled in Google Account
3. Try generating a fresh app password

## 🔒 **Security Notes**

- **App passwords bypass 2FA** - treat them like regular passwords
- **Revoke unused passwords** in Google Account settings
- **Never commit passwords** to version control
- **Use environment variables** only

## 📊 **Gmail Sending Limits**

Gmail has built-in sending limits:
- **500 emails per day** for regular Gmail accounts
- **2000 emails per day** for Google Workspace accounts
- Perfect for contact form responses!

## 🎨 **Customizing the Email**

Edit `simpleEmailService.js` to customize:
- Email subject line
- HTML template
- Colors and branding
- Social media links
- Call-to-action buttons

---

## Quick Setup Checklist

- [ ] Enable 2FA on Gmail account
- [ ] Generate app password
- [ ] Add `GMAIL_USER` to environment variables
- [ ] Add `GMAIL_APP_PASSWORD` to environment variables  
- [ ] Deploy and test `/test-email` endpoint
- [ ] Test with real form submission

**That's it!** Much simpler than OAuth and completely free! 🎉