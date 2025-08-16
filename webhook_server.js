require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');

const app = express();
const port = process.env.PORT || 3000;

// Notion client initialization
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

// Use CORS for all routes
app.use(cors());


// Global middleware to parse URL-encoded data (for FormSubmit webhooks)
app.use(express.urlencoded({ extended: true }));

// Also add JSON parsing for other potential webhooks
app.use(express.json());
=======
// Add URL-encoded parser for FormSubmit webhooks
app.use('/webhook', express.urlencoded({ extended: true }));


// --- FIXED WEBHOOK ENDPOINT ---
app.post('/webhook', async (req, res) => {
  console.log('Webhook received a POST request.');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Raw body:', req.body);
  
  // 1. Handle Notion's verification challenge FIRST (for direct Notion webhooks)
  const challenge = req.headers['x-notion-webhook-challenge'];
  if (challenge) {
    console.log('Received Notion webhook challenge:', challenge);
    // Return the challenge in the response body as plain text
    return res.status(200).type('text/plain').send(challenge);
  }

  // 2. Extract form data from FormSubmit's URL-encoded payload
  const { name, email, message } = req.body;
  
  console.log('Extracted form data:', { name, email, message });

  if (!name || !email || !message) {
    console.error('Validation Error: Missing required fields.');
    console.log('Received data:', { name, email, message });
    console.log('All body keys:', Object.keys(req.body));
    return res.status(400).send('Missing required fields: name, email, message');
  }

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
    res.status(200).send('Form data successfully submitted to Notion.');
  } catch (error) {
    console.error('Error submitting to Notion:', error.message);
    console.error('Full error:', error);
    res.status(500).send('Failed to submit form data to Notion.');
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('Server is running and healthy.');
});

// Debug endpoint to test webhook data
app.post('/debug', (req, res) => {
  console.log('=== DEBUG ENDPOINT ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body:', req.body);
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('======================');
  
  res.status(200).json({
    message: 'Debug data logged',
    body: req.body,
    contentType: req.headers['content-type']
  });
});

// Additional health check for webhook endpoint
app.get('/webhook', (req, res) => {
  res.status(200).json({ 
    status: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Environment check:');
  console.log('- NOTION_API_KEY:', process.env.NOTION_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('- NOTION_DATABASE_ID:', process.env.NOTION_DATABASE_ID ? '✓ Set' : '✗ Missing');
});