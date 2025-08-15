Alan Ayala García - Personal Portfolio Website
A modern, responsive personal portfolio website showcasing my journey as a 19-year-old entrepreneur and tech enthusiast. Built with clean HTML5, custom CSS3, and vanilla JavaScript.
🌟 Features

Dynamic Hero Section - Smooth crossfading slideshow with Ken Burns effect animation
Responsive Design - Mobile-first approach with hamburger navigation menu
Multi-Page Architecture - Home, About Me, What's Next, and Contact pages
Interactive Elements - Hover effects, smooth transitions, and form handling
Professional Layout - Instagram-style gallery cards and modern typography

🛠️ Technologies Used

HTML5 - Semantic markup with proper accessibility
CSS3 - Custom styling with Flexbox, Grid, and animations
JavaScript - Dynamic slideshow and mobile menu functionality
Bootstrap 5 - Responsive utilities and components
Font Awesome - Social media and contact icons
Google Fonts - Poppins typography for modern aesthetics

📱 Responsive Design

Desktop-first design with mobile optimizations
Collapsible hamburger menu for mobile devices
Flexible grid systems that adapt to all screen sizes
Optimized images and typography scaling

## Webhook Server Setup

This project includes a Node.js webhook server to connect the contact form to a Notion database.

### Prerequisites

- Node.js and npm installed
- A Notion account and a database with the following columns:
  - `Name` (Title)
  - `Email` (Email)
  - `Message` (Text)
  - `Date Submitted` (Date)

### Setup Instructions

1.  **Install Dependencies:**
    Open your terminal in the project root and run:
    ```bash
    npm install
    ```

2.  **Create Environment File:**
    Create a `.env` file in the project root by copying the example file:
    ```bash
    cp .env.example .env
    ```

3.  **Configure Environment Variables:**
    Open the `.env` file and replace the placeholder values with your Notion API key, database ID, and a secure webhook secret.

    You can generate a secure secret with the following command:
    ```bash
    openssl rand -base64 32
    ```

    Your `.env` file should look like this:
    ```
    NOTION_API_KEY=your_notion_api_key
    NOTION_DATABASE_ID=your_notion_database_id
    WEBHOOK_SECRET=your_generated_secret
    ```

4.  **Update Contact Form:**
    Open `contact.html` and update the `_webhook` input value to include your secret as a query parameter. Replace `your_webhook_url` with the actual URL of your deployed server and `your_generated_secret` with the secret you created.
    ```html
    <input type="hidden" name="_webhook" value="your_webhook_url?secret=your_generated_secret">
    ```
    For example:
    ```html
    <input type="hidden" name="_webhook" value="https://notion-forms-agent.onrender.com/webhook?secret=your_generated_secret">
    ```


5.  **Run the Server:**
    Start the webhook server with the following command:
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:3000`.