# LLM Tuner - No-Code Fine-Tuning Platform

A comprehensive web platform for fine-tuning Large Language Models without requiring coding knowledge. Built with React, Express.js, and TypeScript, this platform provides an intuitive interface for managing training jobs, uploading datasets, configuring hyperparameters, and monitoring training progress in real-time.

## Features

### 🚀 Core Functionality
- **Job Management**: Create, manage, and monitor multiple training jobs
- **File Upload**: Drag-and-drop interface supporting JSON, CSV, and TXT formats
- **Model Selection**: Choose from popular base models (GPT-3.5, GPT-4, Llama 2, Mistral, etc.)
- **Hyperparameter Configuration**: Interactive sliders and input fields for fine-tuning parameters
- **Real-time Monitoring**: Live progress tracking with training logs and metrics
- **Cost Estimation**: Automatic calculation of training costs and time estimates

### 🎨 User Interface
- Clean, modern dashboard with responsive design
- Sidebar navigation for quick job switching
- Professional color scheme with intuitive iconography
- Real-time updates without page refreshes
- Toast notifications for user feedback

### 🔧 Technical Features
- In-memory storage for fast prototyping
- RESTful API with comprehensive error handling
- Type-safe development with TypeScript
- Component-based architecture with shadcn/ui
- Real-time log streaming and progress updates

## Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **TanStack Query** - Data fetching and caching
- **Wouter** - Lightweight client-side routing
- **Lucide React** - Beautiful icon library

### Backend
- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe server development
- **Multer** - File upload handling
- **Zod** - Schema validation and type inference
- **Drizzle ORM** - Type-safe database operations

### Development Tools
- **Vite** - Fast build tool and development server
- **ESBuild** - Fast JavaScript bundler
- **PostCSS** - CSS processing
- **Tailwind CSS** - Utility-first styling

## Project Structure

```
llm-tuner/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # Base UI components (shadcn/ui)
│   │   │   ├── file-upload.tsx
│   │   │   ├── hyperparameters.tsx
│   │   │   ├── model-selection.tsx
│   │   │   ├── performance-metrics.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── training-progress.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-toast.ts
│   │   │   └── use-training.ts
│   │   ├── lib/              # Utility libraries
│   │   │   ├── constants.ts
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── pages/            # Page components
│   │   │   ├── dashboard.tsx
│   │   │   └── not-found.tsx
│   │   ├── App.tsx           # Main application component
│   │   ├── index.css         # Global styles and CSS variables
│   │   └── main.tsx          # Application entry point
│   └── index.html            # HTML template
├── server/                   # Backend Express application
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API route definitions
│   ├── storage.ts            # In-memory storage implementation
│   └── vite.ts               # Vite development server setup
├── shared/                   # Shared types and schemas
│   └── schema.ts             # Database schema and type definitions
├── uploads/                  # File upload directory
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── vite.config.ts            # Vite build configuration
├── postcss.config.js         # PostCSS configuration
└── components.json           # shadcn/ui configuration
```

## Installation and Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd llm-tuner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Lint code
npm run lint
```

## Code Flow Explanation

### 1. Application Initialization
1. **Server Startup** (`server/index.ts`)
   - Express server starts on port 5000
   - Middleware setup for CORS, JSON parsing, session management
   - API routes registration from `server/routes.ts`
   - Vite development server integration for frontend

2. **Frontend Bootstrap** (`client/src/main.tsx`)
   - React application mounts to DOM
   - QueryClient provider setup for data fetching
   - Tooltip provider for UI components
   - Toast system initialization

### 2. Dashboard Loading Flow
1. **App Component** (`client/src/App.tsx`)
   - Router setup with Wouter
   - Route definitions (Dashboard, 404)

2. **Dashboard Component** (`client/src/pages/dashboard.tsx`)
   - Fetches training jobs via `useTrainingJobs` hook
   - Auto-selects most recent job
   - Renders header, sidebar, and main content sections

### 3. Job Management Flow
1. **Job Creation**
   - User clicks "New Training Job" in sidebar
   - Modal opens with form input
   - `useCreateTrainingJob` hook sends POST request to `/api/training-jobs`
   - Server validates data with Zod schema
   - New job stored in memory storage
   - UI updates with new job selected

2. **Job Selection**
   - User clicks on job in sidebar
   - `selectedJobId` state updates
   - All components receive new job ID
   - Components fetch job-specific data

### 4. File Upload Flow
1. **File Selection** (`client/src/components/file-upload.tsx`)
   - User drags files or clicks to select
   - File validation (JSON, CSV, TXT only)
   - Files stored in component state

2. **Upload Process**
   - `useUploadFiles` hook creates FormData
   - POST request to `/api/training-jobs/:id/files`
   - Multer middleware handles file processing
   - Files saved to `uploads/` directory
   - File metadata stored in memory

### 5. Model Configuration Flow
1. **Model Selection** (`client/src/components/model-selection.tsx`)
   - Dropdown populated from `BASE_MODELS` constant
   - Selection triggers `useUpdateTrainingJob` hook
   - PATCH request updates job configuration

2. **Hyperparameter Configuration** (`client/src/components/hyperparameters.tsx`)
   - Interactive sliders and inputs
   - Real-time cost estimation via `/api/estimate` endpoint
   - Auto-configuration based on task type
   - Updates saved to job configuration

### 6. Training Execution Flow
1. **Training Start** (`client/src/components/training-progress.tsx`)
   - User clicks "Start Training"
   - POST request to `/api/training-jobs/:id/start`
   - Server updates job status to "running"
   - `simulateTraining` function begins progress simulation

2. **Progress Monitoring**
   - Real-time polling every 2 seconds
   - Progress bar updates with completion percentage
   - Live metrics display (loss, accuracy, learning rate)
   - Training logs stream to console-like interface

3. **Training Completion**
   - Simulation reaches 100% progress
   - Job status updated to "completed"
   - Final metrics calculated and stored
   - Export options become available

### 7. Data Flow Architecture

```
Frontend Components
       ↓
Custom React Hooks (useTraining.ts)
       ↓
TanStack Query (queryClient.ts)
       ↓
API Routes (server/routes.ts)
       ↓
Zod Validation (shared/schema.ts)
       ↓
Storage Layer (server/storage.ts)
       ↓
In-Memory Storage (Maps)
```

## API Endpoints

### Training Jobs
- `GET /api/training-jobs` - List all jobs
- `GET /api/training-jobs/:id` - Get specific job
- `POST /api/training-jobs` - Create new job
- `PATCH /api/training-jobs/:id` - Update job
- `DELETE /api/training-jobs/:id` - Delete job

### Training Control
- `POST /api/training-jobs/:id/start` - Start training
- `POST /api/training-jobs/:id/pause` - Pause training
- `POST /api/training-jobs/:id/stop` - Stop training

### File Management
- `POST /api/training-jobs/:id/files` - Upload files
- `GET /api/training-jobs/:id/files` - List job files

### Utilities
- `GET /api/training-jobs/:id/logs` - Get training logs
- `POST /api/estimate` - Estimate cost and time

## Configuration

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)

### File Upload Limits
- Maximum file size: 100MB
- Supported formats: JSON, CSV, TXT
- Multiple file upload supported

### Model Options
The platform supports various base models:
- GPT-3.5 Turbo (fast, low cost)
- GPT-4 (high capability, higher cost)
- Llama 2 7B/13B (open source)
- Mistral 7B (efficient)
- Claude Instant (conversational)
- PaLM 2 (multilingual)

## Development Guidelines

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Consistent naming conventions
- Comprehensive error handling

### Component Architecture
- Single responsibility principle
- Props interface definitions
- Reusable UI components
- Custom hooks for business logic

### Data Management
- TanStack Query for server state
- React state for local UI state
- Zod schemas for validation
- Type-safe API contracts

## Future Enhancements

### Planned Features
- Database persistence (PostgreSQL)
- User authentication and authorization
- Model versioning and comparison
- Advanced visualization charts
- Export to popular ML frameworks
- Integration with cloud training services
- Collaborative training job sharing

### Technical Improvements
- WebSocket connections for real-time updates
- Background job processing with queues
- Horizontal scaling support
- Advanced monitoring and alerting
- Automated testing suite

## Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### Code Quality
- Follow TypeScript best practices
- Maintain test coverage
- Use conventional commits
- Update documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions, issues, or contributions:
- Create GitHub issues for bugs
- Submit feature requests
- Join community discussions
- Check documentation wiki

---

Built with ❤️ for the machine learning community