require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('@notionhq/client');

const app = express();
const port = process.env.PORT || 3000;

// Notion client initialization
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

// Use CORS for all routes
app.use(cors());

// --- MODIFIED WEBHOOK ENDPOINT ---
// We use bodyParser.json() inside the route to control its execution order.
app.post('/webhook', bodyParser.json(), async (req, res) => {
  console.log('Webhook received a POST request.');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  // 1. Immediately handle Notion's verification challenge
  if (req.headers['x-notion-webhook-challenge']) {
    console.log('Received Notion webhook challenge.');
    // Respond directly to the challenge
    res.set('x-notion-webhook-challenge', req.headers['x-notion-webhook-challenge']);
    return res.status(200).send();
  }

  // 2. Process form submissions from FormSubmit.co
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    console.error('Validation Error: Missing required fields.');
    return res.status(400).send('Missing required fields: name, email, message');
  }

  try {
    console.log('Attempting to create Notion page...');
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Name': { title: [{ text: { content: name } }] },
        'Email': { email: email },
        'Message': { rich_text: [{ text: { content: message } }] },
        'Date Submitted': { date: { start: new Date().toISOString() } },
      },
    });
    console.log('Successfully added to Notion.');
    res.status(200).send('Form data successfully submitted to Notion.');
  } catch (error) {
    console.error('Error submitting to Notion:', error);
    res.status(500).send('Failed to submit form data to Notion.');
  }
});

// Health check endpoint remains the same
app.get('/', (req, res) => {
  res.status(200).send('Server is running and healthy.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});