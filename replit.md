# LLM Tuner Platform - Project Documentation

## Project Overview

A minimalist no-code web platform for fine-tuning Large Language Models. Built with React, Express.js, and TypeScript, providing a clean interface for uploading training data and configuring hyperparameters with Python file processing capabilities.

**Current Status**: Simplified minimalist version with file upload and hyperparameters only
**Last Updated**: June 25, 2025

## Recent Changes

- ✅ **Code Architecture Split** (Jun 25): Separated routes.ts into routes.ts and tuner.ts for better organization
- ✅ **GPT-2 Integration** (Jun 25): Integrated uploaded file content directly into GPT-2 fine-tuning pipeline
- ✅ **Tuner Module** (Jun 25): Created dedicated tuner.ts with tuner_trigger method for GPT-2 script generation
- ✅ **File Content Processing** (Jun 25): Routes.ts reads uploaded files and passes content to tuner_trigger
- ✅ **Code Cleanup** (Jun 25): Removed unnecessary files and duplicate Python script generation code
- ✅ **Enhanced Upload Flow** (Jun 25): File upload now triggers parallel GPT-2 tuning script generation
- ✅ **Simplified Architecture** (Jun 25): Removed unnecessary components and database complexity

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Multer for file uploads
- **Data Layer**: In-memory storage with Drizzle ORM schema definitions
- **State Management**: TanStack Query for server state, React hooks for local state
- **Validation**: Zod schemas for type-safe API contracts
- **Build Tools**: Vite for fast development and optimized builds

### Key Features Implemented
1. **Job Management**: Create, update, delete training jobs with status tracking
2. **File Upload**: Drag-and-drop interface supporting multiple file formats
3. **Model Configuration**: Base model selection with detailed specifications
4. **Hyperparameter Tuning**: Interactive controls with auto-configuration options
5. **Real-time Monitoring**: Live progress updates, training logs, and metrics
6. **Cost Estimation**: Automatic calculation of training costs and time estimates

### Data Flow
```
User Input → React Components → Custom Hooks → TanStack Query → API Routes → Storage Layer → Response
```

## User Preferences

*No specific user preferences recorded yet*

## Technical Decisions

### Storage Strategy
- **Current**: In-memory storage using JavaScript Maps for rapid prototyping
- **Rationale**: Fast development, no database setup required, suitable for demo purposes
- **Future**: PostgreSQL for production deployment with data persistence

### API Design
- **Pattern**: RESTful endpoints with consistent error handling
- **Validation**: Zod schemas at API boundaries for type safety
- **File Handling**: Multer middleware with size and type validation

### Frontend Architecture
- **Component Strategy**: Feature-based organization with reusable UI components
- **State Management**: Server state via TanStack Query, local state with React hooks
- **Styling**: Utility-first with Tailwind CSS and professional component library

### Real-time Updates
- **Approach**: Polling-based updates every 2 seconds during training
- **Rationale**: Simple implementation, reliable for demo purposes
- **Future Enhancement**: WebSocket connections for true real-time updates

## Development Workflow

### File Organization
- `client/`: Frontend React application with components, hooks, and pages
- `server/routes.ts`: File upload handling, content reading, and API endpoints
- `server/tuner.ts`: GPT-2 fine-tuning script generation and training logic
- `server/index.ts`: Express server setup and middleware configuration
- `shared/`: Type definitions and schemas shared between frontend and backend

### Code Quality Standards
- TypeScript strict mode for type safety
- Consistent naming conventions and file structure
- Comprehensive error handling with user-friendly messages
- Component-based architecture with single responsibility principle

## Deployment Configuration

### Current Setup
- Development server on port 5000
- Vite integration for frontend assets
- File uploads stored in local `uploads/` directory
- In-memory storage without persistence

### Production Considerations
- Database migration to PostgreSQL
- File storage migration to cloud storage (S3, CloudFlare R2)
- Environment variable configuration
- Process management and monitoring

## Known Limitations

1. **Data Persistence**: In-memory storage loses data on server restart
2. **File Storage**: Local file storage not suitable for production scaling
3. **Training Simulation**: Mock training process for demonstration purposes
4. **User Authentication**: No user management or access control implemented
5. **Concurrency**: Single-threaded training simulation without queue management

## Future Enhancements

### High Priority
- [ ] Database persistence implementation
- [ ] Real training integration with ML frameworks
- [ ] User authentication and authorization
- [ ] WebSocket real-time updates

### Medium Priority
- [ ] Advanced visualization charts for training metrics
- [ ] Model versioning and comparison features
- [ ] Export to popular ML frameworks (PyTorch, HuggingFace)
- [ ] Cloud training service integration

### Low Priority
- [ ] Collaborative training job sharing
- [ ] Advanced monitoring and alerting
- [ ] Automated testing suite
- [ ] Performance optimization and caching

## Environment Setup

### Required Dependencies
- Node.js 18+
- npm 9+
- Modern web browser with ES2020 support

### Development Commands
```bash
npm install     # Install dependencies
npm run dev     # Start development server
npm run build   # Build for production
npm start       # Start production server
```

### File Structure
```
llm-tuner/
├── client/src/          # Frontend React app
├── server/              # Backend Express API
├── shared/              # Shared types and schemas
├── uploads/             # File upload storage
└── documentation files  # README, guides, requirements
```

## Documentation Files

- **README.md**: Comprehensive project overview and installation guide
- **PROJECT_STRUCTURE.md**: Detailed file structure and architecture explanation
- **REQUIREMENTS.md**: System requirements and dependencies
- **SETUP_GUIDE.md**: Step-by-step local development setup instructions

## Success Metrics

### Functional Requirements ✅
- Job creation and management
- File upload with validation
- Model and task selection
- Hyperparameter configuration
- Training simulation with progress tracking
- Real-time log streaming
- Performance metrics display

### Non-Functional Requirements ✅
- Responsive design for mobile and desktop
- Professional UI with consistent styling
- Error handling with user feedback
- Type-safe development with TypeScript
- Fast development server with hot reload

## Notes

This project demonstrates a complete full-stack TypeScript application with modern web development practices. The architecture is designed for scalability and maintainability, with clear separation of concerns and comprehensive documentation.

The in-memory storage approach allows for rapid prototyping and demonstration while maintaining the structure needed for easy migration to persistent storage solutions.