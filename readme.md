# NewsTrace - Media Intelligence and Journalist Profiling System

A full-stack real-time intelligence system designed to map and analyze journalists across media outlets. NewsTrace autonomously detects and extracts publicly available journalist profiles from news organizations, providing insights into newsroom structures and journalist networks.

## 🏗️ Architecture

```
newstrace/
├── client/                 # React Frontend (Vite + TailwindCSS)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js Backend (Express + Prisma)
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── .env
└── README.md
```

## 🚀 Tech Stack

### Frontend (Client)
- **React 19** - UI Framework
- **Vite** - Build tool & dev server
- **TailwindCSS 4** - Styling
- **React Router** - Navigation
- **Framer Motion & GSAP** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend (Server)
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Redis (Upstash)** - Queue management
- **Bull** - Job processing
- **Puppeteer** - Web scraping
- **Natural.js** - NLP analysis

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Optional but Recommended
- **Redis** (or use Upstash cloud) - [Upstash](https://upstash.com/)

## 🛠️ Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <https://github.com/LovekeshAnand/NewsTrace>
cd newstrace
```

### Step 2: Setup PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE newstrace;

# Create user (optional)
CREATE USER newstrace_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE newstrace TO newstrace_user;

# Exit
\q
```

### Step 3: Setup Backend (Server)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `server/.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database - Update with your credentials
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/newstrace"

# SERP API - Get key from https://serpapi.com/
SERP_API_KEY=your_serp_api_key

# Redis - Using Upstash (or your local Redis)
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Scraping Configuration
MAX_CONCURRENT_SCRAPES=2
REQUEST_TIMEOUT=90000
MAX_RETRIES=3

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important Environment Variables:**

- `DATABASE_URL`: Your PostgreSQL connection string
- `SERP_API_KEY`: Get free API key from [SerpAPI](https://serpapi.com/) for website detection
- `REDIS_HOST/PORT/PASSWORD`: Redis credentials (get free from [Upstash](https://upstash.com/))

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the server
npm run dev
```

Server will start at `http://localhost:3000`

### Step 4: Setup Frontend (Client)

Open a **new terminal window**:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file (if needed)
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Start the development server
npm run dev
```

Client will start at `http://localhost:5173`

## 🎯 Quick Start

### Starting the Application

You need to run both server and client:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Then open your browser to `http://localhost:5173`

### Using the Application

1. **Enter Media Outlet Name**
   - Type the name of any news outlet (e.g., "The Hindu", "BBC News")
   - Click "Process Outlet"

2. **Wait for Processing**
   - The system will automatically detect the website
   - Scrape journalist profiles (5-15 minutes)
   - Analyze and categorize data

3. **View Results**
   - Browse journalist profiles
   - Explore network graphs
   - Export data to CSV
   - Search and filter journalists

## 📡 API Endpoints

### Outlets
- `POST /api/outlets/process` - Process a new media outlet
- `GET /api/outlets` - Get all processed outlets
- `GET /api/outlets/:id` - Get specific outlet details
- `GET /api/outlets/:id/export` - Export outlet data to CSV
- `GET /api/outlets/:id/graph` - Get network graph data

### Journalists
- `GET /api/journalists/search?q=query` - Search journalists
- `GET /api/journalists/top?limit=10` - Get top journalists
- `GET /api/journalists/:id` - Get journalist details

### Statistics
- `GET /api/statistics` - Get system-wide statistics

### Health Check
- `GET /api/health` - Check API status


## 🔧 Configuration

### Backend Configuration

**Database Connection**
```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

**Redis Configuration** (for job queue)
```env
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

**Scraping Settings**
```env
MAX_CONCURRENT_SCRAPES=2    # Parallel scraping jobs
REQUEST_TIMEOUT=90000       # 90 seconds
MAX_RETRIES=3               # Retry failed requests
```

### Frontend Configuration

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

For production:

```env
VITE_API_URL=https://your-api-domain.com/api
```

## 📦 Build for Production

### Build Backend

```bash
cd server

# Set production environment
NODE_ENV=production

# Run migrations
npx prisma migrate deploy

# Start server
npm start
```

### Build Frontend

```bash
cd client

# Build for production
npm run build

# Preview production build
npm run preview
```

The build output will be in `client/dist/`


## 🧪 Testing

### Test Backend API

```bash
# Check health
curl http://localhost:3000/api/health

# Get statistics
curl http://localhost:3000/api/statistics

# Process outlet
curl -X POST http://localhost:3000/api/outlets/process \
  -H "Content-Type: application/json" \
  -d '{"outletName": "The Hindu", "minProfiles": 30}'
```

### Test Frontend

1. Open `http://localhost:5173`
2. Enter outlet name: "The Hindu"
3. Click "Process Outlet"
4. Wait for results
5. Verify data displays correctly


### Backend (Server)

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio (DB GUI)
```

### Frontend (Client)

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Natural.js for NLP capabilities
- Compromise.js for entity extraction
- Puppeteer for web scraping
- Prisma for database ORM
- React & Vite for frontend framework

---

**Built with ❤️ for ethical journalism research**