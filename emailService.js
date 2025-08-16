const nodemailer = require('nodemailer');
const { google } = require('googleapis');

class EmailService {
  constructor() {
    this.oauth2Client = null;
    this.transporter = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Create OAuth2 client
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground' // Redirect URL
      );

      // Set refresh token
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
      });

      // Get access token
      const accessToken = await this.oauth2Client.getAccessToken();

      // Create transporter
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken.token,
        },
      });

      this.initialized = true;
      console.log('📧 Email service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      return false;
    }
  }

  async sendThankYouEmail(recipientEmail, recipientName, submissionMessage) {
    if (!this.initialized) {
      console.log('⚠️ Email service not initialized, attempting to initialize...');
      const success = await this.initialize();
      if (!success) {
        throw new Error('Email service initialization failed');
      }
    }

    try {
      const emailTemplate = this.createThankYouTemplate(recipientName, submissionMessage);
      
      const mailOptions = {
        from: `Alan Ayala <${process.env.GMAIL_USER}>`,
        to: recipientEmail,
        subject: 'Thanks for reaching out! 🚀',
        html: emailTemplate,
        text: this.createPlainTextVersion(recipientName)
      };

      console.log(`📤 Sending thank-you email to: ${recipientEmail}`);
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Thank-you email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        recipient: recipientEmail
      };
    } catch (error) {
      console.error('❌ Failed to send thank-you email:', error.message);
      throw error;
    }
  }

  createThankYouTemplate(name, originalMessage) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thanks for reaching out!</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .greeting {
                font-size: 20px;
                color: #333;
                margin-bottom: 20px;
            }
            .message {
                background-color: #f8f9fa;
                border-left: 4px solid #007bff;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 5px 5px 0;
            }
            .cta {
                text-align: center;
                margin: 30px 0;
            }
            .cta-button {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: 500;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .social-links {
                margin: 15px 0;
            }
            .social-links a {
                color: #007bff;
                text-decoration: none;
                margin: 0 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">ALAN AYALA GARCÍA</div>
                <div style="color: #666;">Software Engineer & Developer</div>
            </div>
            
            <div class="greeting">
                Hey ${name || 'there'}! 👋
            </div>
            
            <p>Thanks so much for reaching out through my website! It's great to connect with you.</p>
            
            <p>I've received your message and wanted to let you know that I'll get back to you as soon as possible. I typically respond within 24 hours, so keep an eye on your inbox!</p>
            
            ${originalMessage ? `
            <div class="message">
                <strong>Your message:</strong><br>
                "${originalMessage}"
            </div>
            ` : ''}
            
            <div class="cta">
                <a href="https://alan-ayala-website.vercel.app" class="cta-button">
                    Visit My Website
                </a>
            </div>
            
            <p>In the meantime, feel free to check out my latest projects or connect with me on social media. I'm always excited to discuss new opportunities and collaborations!</p>
            
            <p>Looking forward to our conversation!</p>
            
            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Alan Ayala García</strong><br>
                <span style="color: #666;">Software Engineer</span>
            </p>
            
            <div class="footer">
                <div class="social-links">
                    <a href="https://www.linkedin.com/in/alan-ayala-garcia">LinkedIn</a> |
                    <a href="https://github.com/AlanAAG">GitHub</a> |
                    <a href="mailto:alanayalag@gmail.com">Email</a>
                </div>
                <p>This email was sent automatically in response to your contact form submission.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  createPlainTextVersion(name) {
    return `
Hey ${name || 'there'}!

Thanks so much for reaching out through my website! It's great to connect with you.

I've received your message and wanted to let you know that I'll get back to you as soon as possible. I typically respond within 24 hours, so keep an eye on your inbox!

In the meantime, feel free to check out my latest projects or connect with me on social media. I'm always excited to discuss new opportunities and collaborations!

Looking forward to our conversation!

Best regards,
Alan Ayala García
Software Engineer

---
LinkedIn: https://www.linkedin.com/in/alan-ayala-garcia
GitHub: https://github.com/AlanAAG
Website: https://alan-ayala-website.vercel.app

This email was sent automatically in response to your contact form submission.
    `;
  }

  async testEmailConfiguration() {
    try {
      await this.initialize();
      
      // Verify the transporter
      const verification = await this.transporter.verify();
      console.log('✅ Email configuration test passed:', verification);
      return true;
    } catch (error) {
      console.error('❌ Email configuration test failed:', error.message);
      return false;
    }
  }
}

module.exports = EmailService;