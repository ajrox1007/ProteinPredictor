# Protein Predictor ML

A 3D protein analysis tool for drug discovery with AI-powered insights and molecular design capabilities.

<img width="1510" height="783" alt="Screenshot 2025-09-16 at 11 04 49 AM" src="https://github.com/user-attachments/assets/3bf0f5bc-7e1b-4371-97a9-427844bc80c3" />

## Features

- **3D Protein Visualization**: Interactive visualization of protein structures using Three.js
- **AI-Powered Analysis**: Structure prediction and binding site analysis using OpenAI
- **Drug Discovery**: Generate and optimize drug candidates for specific binding sites
- **Molecular Design**: Advanced molecule generation and optimization tools
- **Real-time Analysis**: Live protein data analysis and reporting
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Three.js** for 3D protein visualization
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database management
- **OpenAI API** for AI-powered analysis
- **WebSocket** support for real-time updates

### Database
- **PostgreSQL** (via Neon) for data persistence
- **In-memory storage** fallback for development

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (optional for development)
- OpenAI API key (optional for AI features)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ProteinPredictorML
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   
   Create a `.env` file in the root directory:
   ```bash
   # Database (optional - falls back to in-memory storage)
   DATABASE_URL="postgresql://username:password@localhost:5432/protein_predictor"
   
   # OpenAI API (optional - falls back to mock data)
   OPENAI_API_KEY="your-openai-api-key"
   ```

## Quick Start

### Development Mode

```bash
npm run dev
```

This will start both the backend server and frontend development server. The application will be available at:
- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api

### Production Build

```bash
npm run build
npm start
```

## Configuration

### Database Setup

The application supports two storage modes:

1. **In-Memory Storage** (Default for development)
   - No setup required
   - Includes sample protein data
   - Data is reset on server restart

2. **PostgreSQL Database** (Recommended for production)
   - Set `DATABASE_URL` environment variable
   - Run database migrations: `npm run db:push`

### AI Features

AI-powered analysis features require an OpenAI API key:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Set the `OPENAI_API_KEY` environment variable
3. Without an API key, the app uses computational fallbacks with mock data

## Project Structure

```
ProteinPredictorML/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── ui/             # UI component library
├── server/                 # Backend Express server
│   ├── ai.ts              # AI service integration
│   ├── db.ts              # Database configuration
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage abstraction
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Run database migrations

## API Endpoints

### Proteins
- `GET /api/proteins` - List all proteins
- `GET /api/proteins/:id` - Get protein by ID
- `POST /api/proteins` - Create new protein
- `PUT /api/proteins/:id` - Update protein
- `DELETE /api/proteins/:id` - Delete protein

### Analysis
- `POST /api/analysis/structure/:proteinId` - Analyze protein structure
- `POST /api/analysis/binding-sites/:proteinId` - Analyze binding sites
- `GET /api/analysis/:proteinId` - Get analysis results

### Drug Discovery
- `POST /api/molecules/generate/:bindingSiteId` - Generate drug candidates
- `POST /api/molecules/optimize/:candidateId` - Optimize existing molecule

## Development

### Setting Up for Development

1. The app runs in development mode with in-memory storage by default
2. Sample protein data is automatically loaded
3. AI features use mock data when no API key is provided
4. Hot reloading is enabled for both frontend and backend

### Database Development

To use a real database during development:

1. Set up a PostgreSQL database
2. Set the `DATABASE_URL` environment variable
3. Run migrations: `npm run db:push`

### Adding New Features

1. **Frontend components**: Add to `client/src/components/`
2. **API endpoints**: Add to `server/routes.ts`
3. **Database schema**: Update `shared/schema.ts`
4. **AI services**: Extend `server/ai.ts`

## Deployment

### Environment Variables for Production

```bash
DATABASE_URL="your-production-database-url"
OPENAI_API_KEY="your-openai-api-key"
NODE_ENV="production"
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **tsx command not found**
   ```bash
   npm install
   ```

2. **Database connection errors**
   - Check DATABASE_URL format
   - Ensure database is running
   - Or run without DATABASE_URL for in-memory storage

3. **OpenAI API errors**
   - Check API key validity
   - Or run without OPENAI_API_KEY for mock data

4. **Port already in use**
   - Change port in server configuration
   - Or kill existing process on port 5000

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on the project repository.

