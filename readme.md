# NewsTrace 2.0 🕵️‍♂️📰

NewsTrace is a high-performance, enterprise-grade media intelligence platform designed to scrape news outlets, profile journalists, and synthesize media coverage across the web.

Built with a sleek, minimalist aesthetic inspired by Perplexity, NewsTrace 2.0 moves beyond basic web scraping to offer deep internet research, contact discovery, and automated journalism tracking.

## ✨ Key Features

- **Blazing Fast Scraping Engine**: Automatically extracts hundreds of journalist profiles, coverage beats, and articles from major publications in minutes.
- **Research Mode (New!)**: A Perplexity-style intelligence engine. Ask any question and receive instant synthesized summaries backed by direct, clickable citations to real journalistic sources.
- **Intelligent Contact Discovery**: Automatically locates and extracts emails, Twitter handles, and LinkedIn profiles for discovered journalists.
- **Enterprise-Grade Security**: Fully protected by JWT-based authentication. Your research tasks, data, and scraped contacts are securely sandboxed to your account.
- **Robust Persistence**: Background scraping tasks are intelligently managed via MongoDB. You can navigate away from a task and resume its progress bar instantly upon returning.

## 💻 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB (Atlas)
- **Scraping & NLP**: Puppeteer, Natural.js, Compromise NLP, SERP API
- **Security**: Bcryptjs, JSON Web Tokens (JWT), Express Rate Limit, Helmet

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- SerpAPI Key (for Research Mode)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/LovekeshAnand/NewsTrace.git
   cd NewsTrace
   ```

2. Install dependencies for both the backend and frontend:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. Setup environment variables in `server/.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   SERP_API_KEY=your_serp_api_key
   ```

### Running the Application

Start the backend (from the `/server` directory):
```bash
npm run dev
```

Start the frontend (from the `/client` directory):
```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

## 📸 Platform Capabilities

1. **Dashboard**: Get a bird's-eye view of all indexed publications, profiles, and currently trending news topics.
2. **Research**: Instantly query the global news database to synthesize answers and discover exact article sources.
3. **Scrape**: Queue up a publication domain (e.g., `theverge.com`) and let the headless scraper discover the authors and their recent coverage.
4. **Outlets & Journalists**: Browse the centralized directory of all data you have extracted.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is open-sourced and available under the MIT License.