# Gmail OAuth Setup Guide

This guide will help you set up Gmail OAuth authentication for the automated thank-you email feature.

## 📋 Prerequisites

- A Gmail account
- Access to Google Cloud Console
- Your deployed webhook server

## 🔧 Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

## 🔑 Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add these authorized redirect URIs:
   ```
   https://developers.google.com/oauthplayground
   ```
5. Download the JSON file with your credentials

## 🎯 Step 3: Get Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your:
   - OAuth Client ID
   - OAuth Client Secret
5. In the left sidebar, find "Gmail API v1"
6. Select: `https://www.googleapis.com/auth/gmail.send`
7. Click "Authorize APIs"
8. Sign in with your Gmail account
9. Click "Exchange authorization code for tokens"
10. Copy the **refresh_token** (you'll need this!)

## 🔐 Step 4: Set Environment Variables

Add these variables to your environment (Render dashboard > Environment tab):

```bash
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

### Variable Descriptions:

- **GMAIL_USER**: Your Gmail address (the "from" address for emails)
- **GMAIL_CLIENT_ID**: From your OAuth credentials JSON
- **GMAIL_CLIENT_SECRET**: From your OAuth credentials JSON  
- **GMAIL_REFRESH_TOKEN**: From OAuth playground step above

## ✅ Step 5: Test Configuration

1. Deploy your updated webhook server
2. Visit: `https://your-webhook-url.com/test-email`
3. Should return: `{"status": "Email service configured correctly"}`

## 🚀 Step 6: Test Complete Flow

1. Submit your contact form
2. Check that:
   - ✅ Form data is saved to Notion
   - ✅ Thank-you email is sent to the submitter
   - ✅ You receive the original notification email

## 🔍 Troubleshooting

### Common Issues:

**"Invalid credentials"**
- Double-check all environment variables
- Ensure refresh token is correct
- Verify Gmail API is enabled

**"Access denied"**
- Make sure you granted the correct Gmail scope
- Re-generate refresh token if needed

**"Quota exceeded"**
- Gmail API has daily limits
- Consider implementing rate limiting for high volume

### Debug Steps:

1. Check environment variables: `GET /test-email`
2. Check server logs for email errors
3. Verify OAuth playground token is still valid

## 📧 Email Template Customization

The thank-you email template is in `emailService.js`. You can customize:

- Email subject line
- HTML template design
- Plain text version
- Social media links
- Call-to-action buttons

## 🔒 Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate tokens periodically** (refresh tokens don't expire but can be revoked)
4. **Monitor usage** in Google Cloud Console
5. **Set up alerts** for suspicious activity

## 📊 Monitoring

Monitor email delivery through:
- Server logs (webhook responses)
- Google Cloud Console (API usage)
- Gmail sent folder
- Webhook response includes email status

---

## Quick Reference

**Test email config:** `GET /test-email`  
**Webhook endpoint:** `POST /webhook`  
**OAuth Playground:** https://developers.google.com/oauthplayground  
**Google Cloud Console:** https://console.cloud.google.com/

Need help? Check the server logs or test the `/test-email` endpoint for configuration status.