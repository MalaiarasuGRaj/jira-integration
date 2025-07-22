# Jira Dashboard

A modern, full-stack Jira project management dashboard built with React and Node.js.

## Architecture

This application is structured as a monorepo with separate frontend and backend:

### Frontend (`/src`)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for development and building
- **Lucide React** for icons

### Backend (`/backend`)
- **Node.js** with Express
- **TypeScript** for type safety
- **CORS** and **Helmet** for security
- Direct Jira API integration

## Features

- 🔐 Secure Jira authentication with API tokens
- 📊 Project dashboard with search and filtering
- 🔍 Detailed project information and statistics
- 🎯 Issue type exploration with detailed issue lists
- 📱 Responsive design for all devices
- 🚀 Fast and modern user interface

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Jira account with API token

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up backend environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

This will start:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:3001`

### Building for Production

```bash
npm run build
```

## API Endpoints

### Backend API (`/api/jira`)

- `POST /verify` - Verify Jira credentials
- `POST /projects` - Get all projects
- `POST /projects/:projectKey` - Get project details
- `POST /projects/:projectKey/issues/:issueTypeId` - Get issues by type

## Environment Variables

### Backend (`.env`)
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Project Structure

```
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API client services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── backend/               # Backend source
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── types/         # TypeScript types
│   └── dist/              # Compiled backend code
└── dist/                  # Frontend build output
```

## Security

- API tokens are never stored on the server
- CORS protection enabled
- Helmet.js for security headers
- Input validation on all endpoints
- Secure credential handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details