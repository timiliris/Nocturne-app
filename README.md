# 🎵 Nocturne-app

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![Ionic](https://img.shields.io/badge/Ionic-7+-blue.svg)](https://ionicframework.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5+-blue.svg)](https://www.prisma.io/)
[![Meilisearch](https://img.shields.io/badge/Meilisearch-1.15+-orange.svg)](https://www.meilisearch.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)

> Your personal music streaming platform - Download, organize, and enjoy your music library anywhere.

Nocturne is a self-hosted music streaming application that lets you build and manage your personal music library by downloading royalty-free songs from YouTube. Think of it as your own private Spotify, but with full ownership of your music collection and complete control over your listening experience.

## ✨ Key Features

- 🎧 **Personal Music Streaming**: Stream your downloaded music library from anywhere
- 📱 **Mobile-First Design**: Full-featured mobile app experience that rivals Spotify
- ⬇️ **YouTube Music Downloads**: Download high-quality audio from YouTube (royalty-free content only)
- 🎵 **Complete Music Library**: Organize tracks with metadata, album art, playlists, and favorites
- 🔍 **Lightning-Fast Search**: Find your music instantly with Meilisearch-powered search
- 🎶 **Playlist Management**: Create, edit, and manage custom playlists
- 📻 **Continuous Playback**: Seamless music streaming with queue management
- 🌙 **Offline Support**: Access your music library even without internet connection
- 🎨 **Modern Interface**: Beautiful, intuitive UI designed for music lovers
- 🏠 **Self-Hosted**: Complete control over your music and data - no subscriptions or ads

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend      │    │    Database     │
│                 │    │                  │    │                 │
│  Ionic/Angular  │◄──►│   Express.js     │◄──►│ PostgreSQL +    │
│   Port: 4200    │    │   Port: 3000     │    │    Prisma       │
└─────┬───────────┘    └──────────────────┘    └─────────────────┘
      │                           │
      │                           ▼
      │                  ┌──────────────────┐
      └─────────────────►│   Meilisearch    │
                         │   Port: 7700     │
                         └──────────────────┘
```

### 🎯 Frontend
- **Technologies**: Ionic Framework, Angular, TypeScript
- **Features**: Mobile-first streaming interface, offline playback, playlist management
- **Development Server**: `http://localhost:4200`
- **Music Library**: Direct access to your personal music collection via Meilisearch

### ⚙️ Backend
- **Technologies**: Node.js, Express.js, TypeScript, Prisma ORM
- **Responsibilities**: Music downloads, library management, streaming API, user authentication
- **Development Server**: `http://localhost:3000`

### 🗄️ Database
- **Technology**: PostgreSQL with Prisma ORM
- **Purpose**: Store music metadata, playlists, user preferences, and streaming history
- **Schema Management**: Database migrations and schema handled by Prisma

### 🔍 Music Library Search
- **Technology**: Meilisearch
- **Purpose**: Instant search through your personal music library
- **Development Server**: `http://localhost:7700`
- **Access**: Direct frontend integration for real-time music discovery in your collection

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended for production)
- **Node.js** 20+ and **npm** (for local development only)
- **PostgreSQL** (for local development only)
- **Meilisearch** (for local development only)

> **Note**: When using Docker, all dependencies including PostgreSQL, Meilisearch, and Prisma setup are automatically handled.

### 🐳 Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nocturne.git
   cd nocturne
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Launch with Docker Compose**
   ```bash
   docker-compose up --build
   ```
   > Docker automatically handles Prisma migrations, database setup, and Meilisearch configuration.

4. **Access the application**
    - 🌐 Frontend: http://localhost:4200
    - 🔌 Backend API: http://localhost:3000
    - 🔍 Meilisearch: http://localhost:7700
    - 📊 API Documentation: http://localhost:3000/docs (if available)

### 💻 Local Development Setup

> **For Developers**: Use this setup only if you need to develop/debug locally. For regular usage, Docker setup is recommended.

1. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Database setup** (Development only)
   ```bash
   # Generate Prisma client and run migrations
   cd backend
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed  # Optional: seed with sample data
   ```

3. **Start services** (Development only)
   ```bash
   # Start PostgreSQL (via Docker or local installation)
   # Start Meilisearch (via Docker or local installation)
   
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run serve
   ```

## 📁 Project Structure

```
nocturne/
├── 📂 frontend/          # Ionic/Angular application
│   ├── src/
│   ├── package.json
│   └── ionic.config.json
├── 📂 backend/           # Express.js API server
│   ├── src/
│   ├── prisma/           # Prisma schema and migrations
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
├── 📂 database/          # Database seeds and utilities
├── 📂 docker/            # Docker configuration files
├── 🐳 docker-compose.yml
├── 📋 .env.example
└── 📖 README.md
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
#PostgreSQL connection string
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://user:password@db:5432/spotifydb?schema=public
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=spotifydb

#Meillisearch connection string
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=YourMeilisearchMasterKeyThatsNeededtoBe16BytesLongAtLeast

# Backend session secret for secure cookie handling
SESSION_SECRET=mysecret

# API URL for the frontend to connect to the backend
API_HOST=0.0.0.0
API_PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:4200

# Global variables for the application
GLOBAL_USERNAME=admin
GLOBAL_PASSWORD=password

```

## 🔧 Configuration

### Backend Configuration
Located in `backend/src/config/`:
- Database connection settings via Prisma
- File upload limits
- Audio conversion parameters
- API rate limiting
- Meilisearch integration settings

### Frontend Configuration
Located in `frontend/src/environments/`:
- Backend API endpoints
- Meilisearch connection for music library search
- Audio streaming settings
- Offline playback configuration
- UI themes and customization

## 📚 API Documentation

The backend provides a RESTful API with the following main endpoints:

- `GET /api/library` - Get your music library
- `GET /api/search` - Search your music collection
- `POST /api/download` - Download a new track from YouTube
- `GET /api/stream/:id` - Stream a track from your library
- `GET /api/playlists` - Manage playlists
- `POST /api/playlists` - Create new playlists
- `GET /api/tracks/:id` - Get track details and metadata
- `DELETE /api/tracks/:id` - Remove a track from your library

For detailed API documentation, visit `/docs` when running the backend server.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run e2e

# Database tests (Development only)
cd backend
npx prisma migrate reset --force
npx prisma db seed
```

> **Note**: Prisma operations in Docker are handled automatically during container startup.

## 🚢 Deployment

### Using Docker (Recommended)
```bash
docker-compose -f docker-compose.prod.yml up -d
```
> All database migrations, Prisma setup, and Meilisearch configuration are handled automatically.

### Manual Deployment (Advanced)
> **For Advanced Users**: Manual deployment requires additional setup steps.

1. Build the frontend: `npm run build --prod`
2. Set production environment variables
3. Set up PostgreSQL database
4. Run Prisma migrations: `npx prisma migrate deploy`
5. Generate Prisma client: `npx prisma generate`
6. Set up Meilisearch instance
7. Deploy backend to your server
8. Serve frontend static files via nginx/Apache

## ⚖️ Legal Notice

**IMPORTANT**: This application is designed exclusively for building your personal music library with royalty-free and legally distributable audio content.

- ✅ **Permitted Use**: Royalty-free music, Creative Commons licensed content, public domain audio
- ❌ **Prohibited Use**: Copyrighted material without proper licensing
- 🎵 **Personal Use**: Build your own music collection for personal enjoyment
- 📋 **User Responsibility**: Users are solely responsible for ensuring compliance with applicable copyright laws
- 🚫 **Disclaimer**: The developers disclaim any responsibility for misuse of this application

**Note**: Nocturne is designed as a personal music streaming solution. It's your responsibility to ensure all downloaded content is legally permissible in your jurisdiction.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 **Email**: support@nocturne-app.com
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/nocturne/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/nocturne/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/yourusername/nocturne/wiki)

## 🙏 Acknowledgments

- [YouTube API](https://developers.google.com/youtube) for content discovery
- [FFmpeg](https://ffmpeg.org/) for audio processing
- [Prisma](https://prisma.io/) for database management and type safety
- [Meilisearch](https://meilisearch.com/) for lightning-fast search capabilities
- [Ionic Framework](https://ionicframework.com/) for the mobile-first UI
- All contributors who help make Nocturne better

---

<div align="center">
  <strong>Made with ❤️ by the Nocturne Team</strong>
</div>