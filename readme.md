# NewsTrace 📰

**Media Intelligence and Journalist Profiling System**

An intelligent full-stack platform that autonomously maps and analyzes journalists across media outlets worldwide. NewsTrace uses advanced web scraping, NLP, and network analysis to build comprehensive profiles of newsrooms and their journalists.

![React](https://img.shields.io/badge/react-19.1-61dafb.svg?logo=react)
![Node.js](https://img.shields.io/badge/node.js-18+-339933.svg?logo=node.js)
![Express](https://img.shields.io/badge/express-4.18-000000.svg?logo=express)
![Prisma](https://img.shields.io/badge/prisma-5.7-2d3748.svg?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/tailwind-4.1-06b6d4.svg?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Key Features

- 🤖 **Autonomous Outlet Detection**: Automatically identifies and validates media outlet websites
- 🔍 **Intelligent Profile Scraping**: Extracts journalist profiles using advanced pattern recognition
- 📊 **Network Analysis**: Maps relationships and connections between journalists and outlets
- 🧠 **NLP-Powered Insights**: Natural language processing for beat detection and expertise analysis
- 📈 **Real-time Dashboard**: Live progress tracking with beautiful data visualizations
- 💾 **Data Export**: Export complete datasets to CSV for further analysis
- ⚡ **Job Queue System**: Handles large-scale scraping operations with Bull and Redis
- 🎨 **Modern UI**: Responsive interface built with React 19, Framer Motion, and GSAP animations

## 🎯 Use Cases

- **Media Research**: Analyze newsroom structures and journalist networks
- **PR & Communications**: Identify relevant journalists for specific beats or topics
- **Academic Studies**: Research media landscape and journalist specializations
- **Competitive Intelligence**: Map media outlet capabilities and coverage areas
- **Recruitment**: Discover journalists by expertise and publication history

## 🏗️ Architecture

```
NewsTrace/
│
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route pages
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── utils/                  # Helper functions
│   │   └── App.jsx                 # Main app component
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Node.js Backend (Express)
│   ├── src/
│   │   ├── controllers/            # Request handlers
│   │   ├── services/               # Business logic
│   │   │   ├── scraper/           # Web scraping engine
│   │   │   ├── nlp/               # Natural language processing
│   │   │   └── queue/             # Job queue management
│   │   ├── routes/                 # API routes
│   │   ├── middleware/             # Express middleware
│   │   ├── utils/                  # Utilities & helpers
│   │   └── app.js                  # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── seed.js                 # Database seeding
│   └── package.json
│
└── README.md
```

## 🚀 Tech Stack

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1 | UI Framework |
| Vite | 7.1 | Build tool & dev server |
| TailwindCSS | 4.1 | Utility-first CSS framework |
| React Router | 7.8 | Client-side routing |
| Framer Motion | 12.23 | Animation library |
| GSAP | 3.13 | Advanced animations |
| Recharts | 3.2 | Data visualization |
| Lucide React | 0.543 | Icon library |

### Backend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express | 4.18 | Web framework |
| Prisma | 5.7 | Modern ORM |
| PostgreSQL | 14+ | Primary database |
| Redis | 4.6 | Caching & job queue |
| Bull | 4.12 | Job queue processor |
| Puppeteer | 21.5 | Headless browser scraping |
| Cheerio | 1.0 | HTML parsing |
| Natural.js | 6.10 | NLP and text processing |
| Compromise | 14.10 | Advanced entity extraction |
| Winston | 3.11 | Logging framework |

## 📋 Prerequisites

Ensure you have the following installed:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v14.0 or higher ([Download](https://www.postgresql.org/download/))
- **Redis** or [Upstash](https://upstash.com/) account (cloud Redis)
- **npm** or **yarn** package manager
- **Git** ([Download](https://git-scm.com/))

### Optional Requirements
- **SerpAPI Account**: For automatic website detection ([Get free key](https://serpapi.com/))
- **Docker**: For containerized deployment (optional)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/LovekeshAnand/NewsTrace.git
cd NewsTrace
```

### 2. Database Setup

#### PostgreSQL Setup

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE newstrace;

# Create user (recommended for production)
CREATE USER newstrace_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE newstrace TO newstrace_user;

# Exit PostgreSQL
\q
```

### 3. Backend Configuration

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

Create `server/.env` file:

```env
# ==================== Server Configuration ====================
PORT=3000
NODE_ENV=development

# ==================== Database ====================
# Format: postgresql://user:password@host:port/database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/newstrace?schema=public"

# ==================== External APIs ====================
# Get free API key from https://serpapi.com/ (100 free searches/month)
SERP_API_KEY=your_serpapi_key_here

# ==================== Redis Configuration ====================
# Option 1: Local Redis
# REDIS_HOST=localhost
# REDIS_PORT=6379

# Option 2: Upstash Cloud Redis (Recommended for beginners)
REDIS_HOST=your-redis-endpoint.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_upstash_password

# ==================== Scraping Configuration ====================
MAX_CONCURRENT_SCRAPES=2           # Number of parallel scraping jobs
REQUEST_TIMEOUT=90000              # Request timeout in milliseconds (90s)
MAX_RETRIES=3                      # Number of retries for failed requests
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# ==================== Rate Limiting ====================
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100        # Max requests per window

# ==================== Logging ====================
LOG_LEVEL=info                     # Log level: error, warn, info, debug
LOG_FILE_PATH=logs/app.log

# ==================== Job Queue ====================
QUEUE_REDIS_DB=0                   # Redis DB for Bull queue
QUEUE_MAX_RETRIES=3                # Max job retries
QUEUE_TIMEOUT=1800000              # Job timeout (30 minutes)
```

#### Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npm run seed
```

#### Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Backend API will be available at `http://localhost:3000`

### 4. Frontend Configuration

Open a **new terminal** window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install
```

Create `client/.env`:

```env
# API endpoint
VITE_API_URL=http://localhost:3000/api

# Optional: Enable debug mode
VITE_DEBUG=true
```

#### Start Frontend Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🎮 Usage Guide

### Processing a Media Outlet

1. **Open the Application**
   - Navigate to `http://localhost:5173`

2. **Enter Outlet Information**
   ```
   Outlet Name: "The Hindu"
   Minimum Profiles: 30
   ```

3. **Start Processing**
   - Click "Process Outlet" button
   - System will automatically:
     - Detect the official website
     - Identify journalist profile pages
     - Extract profile information
     - Analyze with NLP
     - Build network graph

4. **Monitor Progress**
   - Watch real-time progress updates
   - View logs and status messages
   - Track completion percentage

5. **Explore Results**
   - Browse journalist profiles
   - View network visualizations
   - Search and filter data
   - Export to CSV

### Example Outlets to Try

- **News Organizations**: BBC News, The Guardian, The New York Times
- **Regional Media**: The Hindu, Times of India, Indian Express
- **Specialized**: TechCrunch, The Verge, Wired
- **International**: Al Jazeera, Reuters, Associated Press

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### **Outlets**

##### Process New Outlet
```http
POST /api/outlets/process
Content-Type: application/json

{
  "outletName": "The Hindu",
  "minProfiles": 30,
  "maxProfiles": 100
}

Response: 200 OK
{
  "success": true,
  "data": {
    "outletId": "clx7...",
    "name": "The Hindu",
    "website": "https://thehindu.com",
    "status": "processing"
  }
}
```

##### Get All Outlets
```http
GET /api/outlets?page=1&limit=20

Response: 200 OK
{
  "success": true,
  "data": {
    "outlets": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

##### Get Outlet Details
```http
GET /api/outlets/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "clx7...",
    "name": "The Hindu",
    "website": "https://thehindu.com",
    "journalistCount": 145,
    "status": "completed",
    "journalists": [...]
  }
}
```

##### Export Outlet Data
```http
GET /api/outlets/:id/export

Response: 200 OK (CSV file download)
```

##### Get Network Graph
```http
GET /api/outlets/:id/graph

Response: 200 OK
{
  "success": true,
  "data": {
    "nodes": [...],
    "edges": [...],
    "metadata": {...}
  }
}
```

#### **Journalists**

##### Search Journalists
```http
GET /api/journalists/search?q=technology&limit=20&offset=0

Response: 200 OK
{
  "success": true,
  "data": {
    "journalists": [...],
    "total": 56,
    "query": "technology"
  }
}
```

##### Get Top Journalists
```http
GET /api/journalists/top?limit=10&sortBy=followers

Response: 200 OK
{
  "success": true,
  "data": [...] // Top 10 journalists
}
```

##### Get Journalist Profile
```http
GET /api/journalists/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "clx9...",
    "name": "Suhasini Haidar",
    "title": "Diplomatic Affairs Editor",
    "email": "suhasini@thehindu.co.in",
    "beats": ["Foreign Policy", "Diplomacy"],
    "articles": [...],
    "socialMedia": {...}
  }
}
```

#### **Statistics**

##### Get System Statistics
```http
GET /api/statistics

Response: 200 OK
{
  "success": true,
  "data": {
    "totalOutlets": 15,
    "totalJournalists": 1247,
    "totalProfiles": 1534,
    "processingJobs": 2,
    "completedJobs": 23,
    "topBeats": ["Politics", "Business", "Technology"],
    "recentActivity": [...]
  }
}
```

#### **Health Check**

```http
GET /api/health

Response: 200 OK
{
  "status": "healthy",
  "timestamp": "2025-03-09T12:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "queue": "running"
  }
}
```

## 🗄️ Database Schema

```prisma
model Outlet {
  id              String      @id @default(cuid())
  name            String
  website         String      @unique
  country         String?
  language        String?
  category        String?
  status          String      @default("pending")
  journalists     Journalist[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([name])
  @@index([status])
}

model Journalist {
  id              String      @id @default(cuid())
  outletId        String
  outlet          Outlet      @relation(fields: [outletId], references: [id], onDelete: Cascade)
  
  name            String
  title           String?
  email           String?
  bio             String?      @db.Text
  profileUrl      String?
  imageUrl        String?
  
  beats           String[]
  expertise       String[]
  socialMedia     Json?
  
  articles        Article[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([outletId])
  @@index([name])
  @@unique([outletId, email])
}

model Article {
  id              String      @id @default(cuid())
  journalistId    String
  journalist      Journalist  @relation(fields: [journalistId], references: [id], onDelete: Cascade)
  
  title           String
  url             String      @unique
  publishedAt     DateTime?
  excerpt         String?     @db.Text
  
  createdAt       DateTime    @default(now())
  
  @@index([journalistId])
  @@index([publishedAt])
}

model ScrapingJob {
  id              String      @id @default(cuid())
  outletId        String
  
  status          String      @default("queued")
  progress        Int         @default(0)
  totalProfiles   Int         @default(0)
  scrapedProfiles Int         @default(0)
  
  startedAt       DateTime?
  completedAt     DateTime?
  error           String?     @db.Text
  
  metadata        Json?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([outletId])
  @@index([status])
}
```

## 🔒 Security Features

### Backend Security
- ✅ **Helmet.js**: Security headers (XSS, clickjacking protection)
- ✅ **CORS**: Configured for frontend origin
- ✅ **Rate Limiting**: Prevents API abuse (100 req/15min)
- ✅ **Request Validation**: Input sanitization and validation
- ✅ **Error Handling**: Secure error messages (no stack traces in production)
- ✅ **SQL Injection Protection**: Prisma ORM with parameterized queries

### Scraping Ethics
- ✅ **robots.txt Compliance**: Respects site crawling rules
- ✅ **Rate Limiting**: Delays between requests
- ✅ **User Agent**: Identifies as research tool
- ✅ **Retry Logic**: Exponential backoff on failures
- ✅ **Public Data Only**: Only scrapes publicly available information

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Eye-friendly dark theme
- **Real-time Updates**: Live progress tracking with WebSockets
- **Smooth Animations**: GSAP and Framer Motion for fluid UX
- **Data Visualization**: Interactive charts and network graphs
- **Search & Filter**: Advanced filtering and search capabilities
- **Export Options**: Download data in CSV format
- **Toast Notifications**: User-friendly feedback messages

## 📊 Performance Optimization

### Frontend
- ✅ Code splitting with React.lazy
- ✅ Image optimization and lazy loading
- ✅ Memoization with React.memo and useMemo
- ✅ Virtual scrolling for large lists
- ✅ Debounced search inputs

### Backend
- ✅ Database indexing on frequently queried fields
- ✅ Redis caching for API responses
- ✅ Connection pooling with Prisma
- ✅ Compression middleware for responses
- ✅ Queue-based job processing (non-blocking)

## 🧪 Testing

### Backend Testing
```bash
cd server

# Test health endpoint
curl http://localhost:3000/api/health

# Test statistics
curl http://localhost:3000/api/statistics

# Test outlet processing
curl -X POST http://localhost:3000/api/outlets/process \
  -H "Content-Type: application/json" \
  -d '{"outletName": "TechCrunch", "minProfiles": 20}'
```

### Frontend Testing
```bash
cd client

# Run linter
npm run lint

# Build production bundle
npm run build

# Preview production build
npm run preview
```

## 🛠️ NPM Scripts

### Server Scripts
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
npm run migrate      # Run Prisma migrations
npm run generate     # Generate Prisma Client
npm run seed         # Seed database with sample data
```

### Client Scripts
```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Test connection
psql -U postgres -d newstrace
```

**Redis Connection Errors**
```bash
# Check Redis is running (local)
redis-cli ping

# Should respond: PONG
```

**Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Puppeteer Installation Issues**
```bash
# Install system dependencies (Ubuntu/Debian)
sudo apt-get install -y chromium-browser

# macOS
brew install chromium
```

## 📜 License

MIT License © 2025 Lovekesh Anand

## ⚠️ Disclaimer

NewsTrace is designed for **ethical research and journalism analysis only**. Users must:
- Only scrape publicly available information
- Not use data for harassment or unauthorized contact
- Comply with GDPR and data protection laws
- Use responsibly and ethically


## 📧 Contact

**Lovekesh Anand**
- GitHub: [@LovekeshAnand](https://github.com/LovekeshAnand)
- Repository: [NewsTrace](https://github.com/LovekeshAnand/NewsTrace)
- Issues: [Report a bug](https://github.com/LovekeshAnand/NewsTrace/issues)

---

**Built with 📰 for ethical journalism research and ❤️ for open source**