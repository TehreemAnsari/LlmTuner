# Project Structure - LLM Tuner Platform

This document provides a comprehensive overview of the project's file organization, architecture, and detailed explanations of each component.

## Directory Overview

```
llm-tuner/
├── client/                    # Frontend React Application
├── server/                    # Backend Express API
├── shared/                    # Shared Types & Schemas
├── uploads/                   # File Upload Storage
└── config files               # Build & Development Configuration
```

## Detailed File Structure

### Root Level Configuration Files

```
├── package.json              # Project dependencies and npm scripts
├── package-lock.json         # Dependency lock file for consistent installs
├── tsconfig.json            # TypeScript compiler configuration
├── vite.config.ts           # Vite build tool configuration
├── tailwind.config.ts       # Tailwind CSS utility configuration
├── postcss.config.js        # PostCSS processing configuration
├── components.json          # shadcn/ui component library config
├── drizzle.config.ts        # Database ORM configuration
├── .gitignore              # Git ignore patterns
├── .replit                 # Replit deployment configuration
├── README.md               # Project documentation
├── PROJECT_STRUCTURE.md    # This file
└── requirements.txt        # Project requirements list
```

### Client Directory Structure

```
client/
├── index.html              # HTML template and entry point
└── src/                    # Source code directory
    ├── components/         # React components
    │   ├── ui/            # Base UI components (shadcn/ui)
    │   │   ├── accordion.tsx
    │   │   ├── alert-dialog.tsx
    │   │   ├── alert.tsx
    │   │   ├── aspect-ratio.tsx
    │   │   ├── avatar.tsx
    │   │   ├── badge.tsx
    │   │   ├── breadcrumb.tsx
    │   │   ├── button.tsx
    │   │   ├── calendar.tsx
    │   │   ├── card.tsx
    │   │   ├── carousel.tsx
    │   │   ├── chart.tsx
    │   │   ├── checkbox.tsx
    │   │   ├── collapsible.tsx
    │   │   ├── command.tsx
    │   │   ├── context-menu.tsx
    │   │   ├── dialog.tsx
    │   │   ├── drawer.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── form.tsx
    │   │   ├── hover-card.tsx
    │   │   ├── input-otp.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── menubar.tsx
    │   │   ├── navigation-menu.tsx
    │   │   ├── pagination.tsx
    │   │   ├── popover.tsx
    │   │   ├── progress.tsx
    │   │   ├── radio-group.tsx
    │   │   ├── resizable.tsx
    │   │   ├── scroll-area.tsx
    │   │   ├── select.tsx
    │   │   ├── separator.tsx
    │   │   ├── sheet.tsx
    │   │   ├── sidebar.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── slider.tsx
    │   │   ├── switch.tsx
    │   │   ├── table.tsx
    │   │   ├── tabs.tsx
    │   │   ├── textarea.tsx
    │   │   ├── toast.tsx
    │   │   ├── toaster.tsx
    │   │   ├── toggle-group.tsx
    │   │   ├── toggle.tsx
    │   │   └── tooltip.tsx
    │   ├── file-upload.tsx     # File upload with drag-and-drop
    │   ├── hyperparameters.tsx # Training parameter configuration
    │   ├── model-selection.tsx # Base model selection interface
    │   ├── performance-metrics.tsx # Model performance display
    │   ├── sidebar.tsx         # Job management sidebar
    │   └── training-progress.tsx # Training status and control
    ├── hooks/                  # Custom React hooks
    │   ├── use-mobile.tsx      # Mobile device detection
    │   ├── use-toast.ts        # Toast notification system
    │   └── use-training.ts     # Training API integration
    ├── lib/                    # Utility libraries
    │   ├── constants.ts        # Application constants
    │   ├── queryClient.ts      # TanStack Query configuration
    │   └── utils.ts            # Utility functions
    ├── pages/                  # Page components
    │   ├── dashboard.tsx       # Main dashboard page
    │   └── not-found.tsx       # 404 error page
    ├── App.tsx                 # Main application component
    ├── index.css              # Global styles and CSS variables
    └── main.tsx               # React application entry point
```

### Server Directory Structure

```
server/
├── index.ts               # Express server entry point
├── routes.ts              # API route definitions and handlers
├── storage.ts             # In-memory storage implementation
└── vite.ts               # Vite development server integration
```

### Shared Directory Structure

```
shared/
└── schema.ts             # Database schemas and type definitions
```

## Detailed File Explanations

### Root Configuration Files

#### `package.json`
- **Purpose**: Defines project metadata, dependencies, and npm scripts
- **Key Dependencies**: React, Express, TypeScript, Tailwind CSS, Vite
- **Scripts**: Development server, build process, type checking
- **Configuration**: Node.js version requirements, module type

#### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Settings**: Strict type checking, ES modules, JSX support
- **Path Mapping**: Absolute imports with @ prefix for clean imports
- **Target**: Modern browsers with ES2020 features

#### `vite.config.ts`
- **Purpose**: Build tool configuration for development and production
- **Features**: React plugin, path aliases, server proxy setup
- **Development**: Hot module replacement, fast refresh
- **Build**: Optimization, code splitting, asset handling

#### `tailwind.config.ts`
- **Purpose**: Tailwind CSS utility framework configuration
- **Theme**: Custom colors, fonts, animations
- **Plugins**: Typography, animations, additional utilities
- **Content**: File patterns for CSS purging

### Frontend Core Files

#### `client/src/main.tsx`
- **Purpose**: React application bootstrap and initialization
- **Responsibilities**:
  - DOM mounting point
  - Provider setup (Query, Tooltip, Toast)
  - Global error boundary
  - Application-wide context providers

#### `client/src/App.tsx`
- **Purpose**: Main application component and routing
- **Responsibilities**:
  - Route configuration with Wouter
  - Global layout structure
  - Navigation between pages
  - Error page handling

#### `client/src/index.css`
- **Purpose**: Global styles, CSS variables, and theme configuration
- **Includes**:
  - Tailwind CSS imports
  - CSS custom properties for theming
  - Dark mode variables
  - Custom component styles
  - Font imports and typography

### Page Components

#### `client/src/pages/dashboard.tsx`
- **Purpose**: Main dashboard page layout and orchestration
- **Responsibilities**:
  - Header with navigation and user info
  - Sidebar integration for job management
  - Main content area with component sections
  - Job selection state management
  - Auto-selection of most recent job

#### `client/src/pages/not-found.tsx`
- **Purpose**: 404 error page for invalid routes
- **Features**: User-friendly error message and navigation back

### Feature Components

#### `client/src/components/sidebar.tsx`
- **Purpose**: Job management and navigation sidebar
- **Features**:
  - Create new training jobs with modal dialog
  - Display list of existing jobs with status indicators
  - Job selection with visual feedback
  - Quick action buttons (Import, Guides)
  - Real-time job status updates

#### `client/src/components/file-upload.tsx`
- **Purpose**: Training data upload interface
- **Features**:
  - Drag-and-drop file upload
  - File type validation (JSON, CSV, TXT)
  - Multiple file selection
  - File size validation and display
  - Sample dataset loading options
  - Upload progress and error handling

#### `client/src/components/model-selection.tsx`
- **Purpose**: Base model selection and task type configuration
- **Features**:
  - Dropdown selection of available models
  - Task type selection for training objective
  - Model information display with capabilities
  - Cost and performance indicators
  - Real-time job configuration updates

#### `client/src/components/hyperparameters.tsx`
- **Purpose**: Training hyperparameter configuration interface
- **Features**:
  - Interactive sliders for numeric parameters
  - Input fields for advanced settings
  - Auto-configuration based on task type
  - Real-time cost and time estimation
  - Parameter validation and tooltips
  - Reset to defaults functionality

#### `client/src/components/training-progress.tsx`
- **Purpose**: Training execution monitoring and control
- **Features**:
  - Progress bar with percentage completion
  - Real-time training metrics display
  - Live training logs with syntax highlighting
  - Training control buttons (Start, Pause, Stop)
  - Auto-refresh during active training
  - Log export functionality

#### `client/src/components/performance-metrics.tsx`
- **Purpose**: Model performance evaluation and export
- **Features**:
  - Training progress visualization placeholder
  - Evaluation metrics display (BLEU, ROUGE, F1, Perplexity)
  - Model export and deployment options
  - Training completion status indicators
  - Performance charts preparation

### Custom Hooks

#### `client/src/hooks/use-training.ts`
- **Purpose**: Training API integration and state management
- **Hooks Provided**:
  - `useTrainingJobs()` - Fetch all training jobs
  - `useTrainingJob(id)` - Fetch specific job details
  - `useCreateTrainingJob()` - Create new training job
  - `useUpdateTrainingJob()` - Update job configuration
  - `useStartTraining()` - Start training process
  - `usePauseTraining()` - Pause active training
  - `useStopTraining()` - Stop training process
  - `useUploadFiles()` - Upload training files
  - `useTrainingLogs(id)` - Fetch training logs with polling
  - `useEstimate()` - Get cost and time estimates

#### `client/src/hooks/use-toast.ts`
- **Purpose**: Toast notification system
- **Features**: Success, error, and info messages with auto-dismiss

#### `client/src/hooks/use-mobile.tsx`
- **Purpose**: Responsive design helper for mobile detection

### Utility Libraries

#### `client/src/lib/constants.ts`
- **Purpose**: Application-wide constants and configuration
- **Contents**:
  - `BASE_MODELS` - Available models with specifications
  - `TASK_TYPES` - Training task options
  - `SAMPLE_DATASETS` - Demo datasets for testing
  - `HYPERPARAMETER_TEMPLATES` - Task-specific parameter presets

#### `client/src/lib/queryClient.ts`
- **Purpose**: TanStack Query configuration and API utilities
- **Features**:
  - Global query client setup
  - Default query options
  - API request wrapper with error handling
  - Response transformation utilities

#### `client/src/lib/utils.ts`
- **Purpose**: General utility functions
- **Functions**: CSS class name concatenation, type guards

### Backend Files

#### `server/index.ts`
- **Purpose**: Express server initialization and configuration
- **Responsibilities**:
  - Server startup and port binding
  - Middleware setup (CORS, JSON parsing, sessions)
  - Route registration
  - Error handling middleware
  - Vite development server integration
  - Static file serving for production

#### `server/routes.ts`
- **Purpose**: API endpoint definitions and request handlers
- **Endpoints**:
  - Training job CRUD operations
  - File upload handling with Multer
  - Training control (start, pause, stop)
  - Log retrieval with real-time updates
  - Cost estimation calculations
  - Training simulation logic

#### `server/storage.ts`
- **Purpose**: Data persistence layer with in-memory storage
- **Features**:
  - `IStorage` interface for data operations
  - `MemStorage` class implementation
  - Training job management
  - File metadata storage
  - Training log storage
  - CRUD operations with proper typing

#### `server/vite.ts`
- **Purpose**: Vite development server integration
- **Features**:
  - Development server middleware
  - Hot module replacement
  - Asset serving
  - Production build serving

### Shared Schema

#### `shared/schema.ts`
- **Purpose**: Type-safe database schema and validation
- **Definitions**:
  - Database table schemas with Drizzle ORM
  - Zod validation schemas
  - TypeScript type inference
  - Insert and select type definitions
  - Hyperparameter validation schema

## Component Architecture Patterns

### State Management Strategy
- **Server State**: TanStack Query for API data
- **Local State**: React useState for UI interactions
- **Form State**: React Hook Form with Zod validation
- **Global State**: Context providers for cross-component data

### Data Flow Pattern
```
User Interaction → Component → Custom Hook → API Call → Server Route → Storage Layer → Response → UI Update
```

### Error Handling Strategy
- **Client Side**: Try-catch blocks with toast notifications
- **Server Side**: Express error middleware with proper HTTP status codes
- **Validation**: Zod schemas at API boundaries
- **Type Safety**: TypeScript for compile-time error prevention

### Real-time Updates
- **Polling**: TanStack Query with refetch intervals
- **Manual Refresh**: User-triggered updates
- **Optimistic Updates**: Immediate UI updates before server confirmation

## Development Workflow

### File Organization Principles
1. **Feature-based**: Components grouped by functionality
2. **Layer Separation**: Clear boundaries between UI, logic, and data
3. **Shared Resources**: Common utilities and types in dedicated directories
4. **Configuration**: All config files at project root

### Import Strategy
- **Absolute Imports**: Using @ prefix for clean import paths
- **Type Imports**: Explicit type-only imports for better tree shaking
- **Barrel Exports**: Index files for clean component exports

### Code Quality Standards
- **TypeScript**: Strict mode with comprehensive type coverage
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit message format

This structure provides a scalable, maintainable architecture that separates concerns while enabling efficient development workflows.