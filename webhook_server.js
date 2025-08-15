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

app.use(cors());
app.use(bodyParser.json());

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  // Handle Notion webhook verification by responding to the challenge
  if (req.headers['x-notion-webhook-challenge']) {
    res.set('x-notion-webhook-challenge', req.headers['x-notion-webhook-challenge']);
    return res.status(200).send();
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('Missing required fields: name, email, message');
  }

  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Name': {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        'Email': {
          email: email,
        },
        'Message': {
          rich_text: [
            {
              text: {
                content: message,
              },
            },
          ],
        },
        'Date Submitted': {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    });
    console.log('Successfully added to Notion:', response);
    res.status(200).send('Form data successfully submitted to Notion.');
  } catch (error) {
    console.error('Error submitting to Notion:', error);
    res.status(500).send('Failed to submit form data to Notion.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
