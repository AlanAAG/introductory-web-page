require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('@notionhq/client');
const url = require('url');
const EmailService = require('./emailService');

const app = express();
const port = process.env.PORT || 3000;

// Notion client initialization
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

// Email service initialization
const emailService = new EmailService();

// Use CORS for all routes
app.use(cors());

// Comprehensive middleware to capture everything from FormSubmit
app.use('/webhook', (req, res, next) => {
  let body = '';
  req.setEncoding('utf8');
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', () => {
    req.rawBody = body;
    
    // Parse body based on content type
    if (req.headers['content-type']?.includes('application/json')) {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (error) {
        console.log('JSON parse error:', error.message);
        req.body = {};
      }
    } else if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      req.body = body ? Object.fromEntries(new URLSearchParams(body)) : {};
    } else {
      req.body = {};
    }
    
    next();
  });
});

// --- COMPREHENSIVE DEBUG WEBHOOK ENDPOINT ---
app.post('/webhook', async (req, res) => {
  console.log('\n=== WEBHOOK DEBUG START ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query params:', req.query);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Content-Length:', req.headers['content-length']);
  console.log('Raw body:', req.rawBody);
  console.log('Raw body length:', req.rawBody?.length || 0);
  console.log('Parsed body:', JSON.stringify(req.body, null, 2));
  console.log('Body keys:', Object.keys(req.body || {}));
  
  // Parse URL for query parameters
  const parsedUrl = url.parse(req.url, true);
  console.log('URL query object:', parsedUrl.query);
  
  // Check if data is in headers (sometimes services send data this way)
  const headerKeys = Object.keys(req.headers);
  const formHeaders = headerKeys.filter(key => 
    key.toLowerCase().includes('form') || 
    key.toLowerCase().includes('data') ||
    key.toLowerCase().includes('name') ||
    key.toLowerCase().includes('email') ||
    key.toLowerCase().includes('message')
  );
  console.log('Potential form data headers:', formHeaders.map(key => `${key}: ${req.headers[key]}`));
  
  console.log('=== WEBHOOK DEBUG END ===\n');
  
  // 1. Handle Notion's verification challenge FIRST (for direct Notion webhooks)
  const challenge = req.headers['x-notion-webhook-challenge'];
  if (challenge) {
    console.log('Received Notion webhook challenge:', challenge);
    return res.status(200).type('text/plain').send(challenge);
  }

  // 2. Try to extract form data from multiple sources
  let formData = {};
  
  // Source 1: Request body
  if (req.body && Object.keys(req.body).length > 0) {
    formData = { ...formData, ...req.body };
    console.log('Found data in body:', req.body);
    
    // IMPORTANT: FormSubmit sends data nested in a 'form_data' field as a JSON string
    if (req.body.form_data && typeof req.body.form_data === 'string') {
      try {
        const parsedFormData = JSON.parse(req.body.form_data);
        console.log('Parsed nested form_data:', parsedFormData);
        formData = { ...formData, ...parsedFormData };
      } catch (error) {
        console.log('Error parsing form_data JSON:', error.message);
      }
    }
  }
  
  // Source 2: Query parameters
  if (parsedUrl.query && Object.keys(parsedUrl.query).length > 0) {
    formData = { ...formData, ...parsedUrl.query };
    console.log('Found data in query params:', parsedUrl.query);
  }
  
  // Source 3: Check for data in specific headers (some services encode data this way)
  for (const headerKey of headerKeys) {
    const value = req.headers[headerKey];
    if (typeof value === 'string' && value.includes('=')) {
      try {
        const decodedParams = Object.fromEntries(new URLSearchParams(value));
        if (decodedParams.name || decodedParams.email || decodedParams.message) {
          formData = { ...formData, ...decodedParams };
          console.log(`Found data in header ${headerKey}:`, decodedParams);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }
  
  console.log('Combined form data from all sources:', formData);

  let { name, email, message } = formData;
  
  // Try alternative field names
  if (!name) name = formData.Name || formData.full_name || formData.fullname || formData['form[name]'];
  if (!email) email = formData.Email || formData.email_address || formData['form[email]'];
  if (!message) message = formData.Message || formData.msg || formData.comments || formData.comment || formData['form[message]'];
  
  console.log('Final extracted data:', { name, email, message });

  if (!name || !email || !message) {
    console.error('Validation Error: Missing required fields after checking all sources.');
    
    const debugResponse = {
      error: 'Missing required fields: name, email, message',
      debug_info: {
        extracted_fields: { name, email, message },
        body_data: req.body,
        query_data: parsedUrl.query,
        available_body_fields: Object.keys(req.body || {}),
        available_query_fields: Object.keys(parsedUrl.query || {}),
        content_type: req.headers['content-type'],
        raw_body_preview: req.rawBody ? req.rawBody.substring(0, 200) : 'empty',
        headers_with_potential_data: formHeaders.map(key => `${key}: ${req.headers[key]}`)
      }
    };
    
    console.log('Sending debug response:', JSON.stringify(debugResponse, null, 2));
    return res.status(400).json(debugResponse);
  }

  // If we have all required fields, proceed with Notion
  try {
    console.log('Attempting to create Notion page...');
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Name': { title: [{ text: { content: name } }] },
        'Email': { email: email },
        'Message': { rich_text: [{ text: { content: message } }] },
        'Date Submitted': { date: { start: new Date().toISOString() } },
      },
    });
    console.log('Successfully added to Notion:', response.id);

    // Send automated thank-you email
    let emailResult = null;
    try {
      console.log('Attempting to send thank-you email...');
      emailResult = await emailService.sendThankYouEmail(email, name, message);
      console.log('Thank-you email sent successfully:', emailResult.messageId);
    } catch (emailError) {
      console.error('Failed to send thank-you email (non-critical):', emailError.message);
      // Don't fail the entire request if email fails - log and continue
    }

    res.status(200).json({ 
      success: true, 
      message: 'Form data successfully submitted to Notion.', 
      notionId: response.id,
      received_data: { name, email, message },
      email_sent: emailResult ? true : false,
      email_details: emailResult ? { messageId: emailResult.messageId } : null
    });
  } catch (error) {
    console.error('Error submitting to Notion:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Failed to submit form data to Notion.', details: error.message });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('Server is running and healthy.');
});

// Additional health check for webhook endpoint  
app.get('/webhook', (req, res) => {
  res.status(200).json({ 
    status: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
});

// Email configuration test endpoint
app.get('/test-email', async (req, res) => {
  try {
    console.log('Testing email configuration...');
    const isConfigured = await emailService.testEmailConfiguration();
    
    if (isConfigured) {
      res.status(200).json({
        status: 'Email service configured correctly',
        timestamp: new Date().toISOString(),
        gmail_user: process.env.GMAIL_USER ? 'Set' : 'Missing'
      });
    } else {
      res.status(500).json({
        status: 'Email service configuration failed',
        timestamp: new Date().toISOString(),
        gmail_user: process.env.GMAIL_USER ? 'Set' : 'Missing'
      });
    }
  } catch (error) {
    console.error('Email test endpoint error:', error.message);
    res.status(500).json({
      status: 'Email test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Environment check:');
  console.log('- NOTION_API_KEY:', process.env.NOTION_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('- NOTION_DATABASE_ID:', process.env.NOTION_DATABASE_ID ? '✓ Set' : '✗ Missing');
  console.log('- GMAIL_USER:', process.env.GMAIL_USER ? '✓ Set' : '✗ Missing');
  console.log('- GMAIL_CLIENT_ID:', process.env.GMAIL_CLIENT_ID ? '✓ Set' : '✗ Missing');
  console.log('- GMAIL_CLIENT_SECRET:', process.env.GMAIL_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
  console.log('- GMAIL_REFRESH_TOKEN:', process.env.GMAIL_REFRESH_TOKEN ? '✓ Set' : '✗ Missing');
  
  // Initialize email service on startup
  emailService.initialize().then((success) => {
    if (success) {
      console.log('📧 Email service ready for automated responses');
    } else {
      console.log('⚠️ Email service failed to initialize - emails will not be sent');
    }
  });
});