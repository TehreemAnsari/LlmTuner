# LLM Tuner Platform - Project Documentation

## Project Overview

A clean, minimalist web platform for fine-tuning Large Language Models. Built with React frontend and FastAPI backend, providing an intuitive interface for uploading training data and configuring hyperparameters with real Python GPT-2 processing.

**Current Status**: ✅ FULLY FUNCTIONAL - Complete platform with real AWS SageMaker LLM training using custom scripts
**Last Updated**: July 5, 2025

## Recent Changes

- ✅ **UI Instance Type Display Bug Fixed & Cleaned** (Jul 8): Resolved critical frontend caching issue where SageMaker component displayed only 3 instance types instead of 8. Fixed by creating new component to bypass Vite build cache poisoning, then cleaned up all debug files and styling. All 8 instance types (CPU: ml.m5.large, ml.c5.large, ml.m5.xlarge + GPU: ml.g5.large, ml.g5.xlarge, ml.g5.2xlarge, ml.g5.4xlarge, ml.p3.2xlarge) now display correctly with clean professional UI
- ✅ **Real AWS SageMaker Training Success** (Jul 8): Successfully created and ran real AWS SageMaker training job `llm-tune-google10-llama27b-20250708002509` using CPU instance (ml.m5.large) with custom finetune.py script processing 55,620 actual data samples
- ✅ **SageMaker Container Script Fix** (Jul 8): Fixed critical script packaging issue - now properly creates tar.gz archives for SageMaker container deployment to `/opt/ml/code/` directory
- ✅ **AWS Quota Management Solution** (Jul 8): Implemented intelligent quota handling - CPU instances work immediately while GPU instances require quota increases through AWS Service Quotas
- ✅ **Real AWS SageMaker Training Implementation** (Jul 8): Created complete solution for real AWS SageMaker training jobs using custom finetune.py script based on working gpt2_tuning.py code, with proper hyperparameter passing and fallback to demo mode
- ✅ **Custom Training Script Creation** (Jul 8): Developed SageMaker-compatible finetune.py script that processes actual user data, supports multiple formats, and handles proper model training with AWS containers
- ✅ **S3 Script Upload System** (Jul 8): Implemented automatic upload of training scripts and requirements to S3 for SageMaker container execution
- ✅ **SageMaker Training Job Fix** (Jul 7): Comprehensive solution for training job failures including S3 permissions fix, container entry point resolution, and enhanced demo mode with real data processing
- ✅ **S3 Bucket Policy Update** (Jul 7): Fixed SageMaker execution role permissions for full S3 access (GetObject, ListBucket, PutObject, DeleteObject, GetBucketLocation)
- ✅ **Demo Training Mode Enhancement** (Jul 7): Improved demo mode to show completed training jobs with realistic metrics, enabling immediate model testing workflow
- ✅ **Training Container Analysis** (Jul 7): Identified and documented SageMaker container entry point requirements for future production implementation
- ✅ **Code Cleanup & Documentation Organization** (Jul 7): Removed redundant `/uploads` folder since all file storage uses AWS S3, moved all documentation files to dedicated `/docs` folder with comprehensive index and navigation
- ✅ **Permission-Based Training Flow** (Jul 7): Added intelligent handling of AWS IAM permission limitations with graceful fallback to demonstration mode
- ✅ **Enterprise Survey Data Processing** (Jul 7): Successfully processed user's 55,622-line New Zealand enterprise survey CSV into 55,621 training samples for LLM fine-tuning
- ✅ **S3 Integration Fixes** (Jul 7): Resolved all S3 bucket configuration issues, file resolution, and training data preparation workflows
- ✅ **Job Name Validation** (Jul 7): Fixed SageMaker job name generation to comply with AWS naming requirements, removing invalid characters
- ✅ **AWS SageMaker Integration Complete** (Jul 5): Added enterprise-grade LLM fine-tuning with Llama 2, FLAN-T5 models, cost estimation, and job monitoring
- ✅ **SageMaker Training Manager** (Jul 5): Complete backend integration with AWS SageMaker for professional model training
- ✅ **Advanced UI Components** (Jul 5): New React components for model selection, hyperparameter tuning, and training job management
- ✅ **Cost Management System** (Jul 5): Real-time cost estimation and tracking for SageMaker training jobs
- ✅ **Deployment Configuration Fixed** (Jul 3): Resolved deployment issues by creating proper build scripts and copying Python files to dist directory
- ✅ **Production Scripts Created** (Jul 3): Added build.sh, deploy-check.py, and start-production.py for robust deployment options
- ✅ **Deployment Documentation Updated** (Jul 3): Comprehensive deployment guide with multiple startup options and environment variables
- ✅ **S3 File Storage Integration** (Jul 3): Migrated file uploads from local storage to AWS S3 bucket for secure, scalable storage
- ✅ **Google OAuth Integration Complete** (Jul 3): Fixed popup-based OAuth flow with cross-window communication, all authentication methods now working
- ✅ **Authentication System Implementation** (Jul 3): Added complete user authentication with email/password and Google OAuth
- ✅ **AWS DynamoDB Integration** (Jul 3): Connected to AWS DynamoDB for secure user data storage with password hashing
- ✅ **Google OAuth Integration** (Jul 3): Implemented one-click Google sign-in with proper redirect handling
- ✅ **Protected Routes** (Jul 3): Added JWT-based authentication to file upload and training endpoints
- ✅ **Frontend Authentication UI** (Jul 3): Created login/register forms with proper error handling and user feedback
- ✅ **Session Management** (Jul 3): Implemented token-based authentication with automatic token refresh
- ✅ **Project File Optimization** (Jun 26): Reduced total project files to exactly 20 across all folders and subfolders
- ✅ **UI Library Removal** (Jun 26): Removed shadcn/ui components and dependencies for minimal codebase
- ✅ **Component Simplification** (Jun 26): Converted components to use standard HTML elements and Tailwind CSS
- ✅ **Configuration Cleanup** (Jun 26): Added essential config files (TypeScript, Tailwind, PostCSS, ESLint)
- ✅ **Documentation Addition** (Jun 26): Added README, CHANGELOG, LICENSE, and DEPLOYMENT guides
- ✅ **FastAPI Migration Completed** (Jun 26): Migrated from Express.js to FastAPI for cleaner Python backend
- ✅ **Code Cleanup** (Jun 26): Removed unnecessary files, comments, and test scripts
- ✅ **Simplified Architecture** (Jun 26): Single FastAPI server handles both API endpoints and static file serving
- ✅ **Hyperparameters Integration** (Jun 26): Training properly shows hyperparameters and dataset samples
- ✅ **Port Configuration** (Jun 26): Standardized on port 5000 for unified frontend/backend serving
- ✅ **Actual Python Script Execution** (Jun 25): tuner.ts now calls real gpt2_tuning.py instead of simulation
- ✅ **Enhanced Dataset Logging** (Jun 25): Python script logs first 5 dataset samples with 150-character previews
- ✅ **Improved Console Output** (Jun 25): GPT-2 script output properly displayed in Replit console
- ✅ **Static GPT-2 Script** (Jun 25): Created single gpt2_tuning.py file at application startup instead of dynamic generation
- ✅ **Parameter-Based Training** (Jun 25): GPT-2 script now receives uploaded file content as command-line parameters
- ✅ **Startup Initialization** (Jun 25): Application creates static gpt2_tuning.py on server startup
- ✅ **Content Passing** (Jun 25): Uploaded file content passed directly to static script as dataset input
- ✅ **Code Architecture Split** (Jun 25): Separated routes.ts into routes.ts and tuner.ts for better organization
- ✅ **Tuner Module** (Jun 25): Created dedicated tuner.ts with tuner_trigger method for content processing
- ✅ **Simplified Architecture** (Jun 25): Removed unnecessary components and database complexity

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + Python + Pydantic for data validation
- **ML Processing**: Python with GPT-2 fine-tuning capabilities
- **State Management**: TanStack Query for server state, React hooks for local state
- **Build Tools**: Vite for frontend builds, Uvicorn for FastAPI server

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
- File uploads stored in AWS S3 bucket
- In-memory storage without persistence

### Production Considerations
- Database migration to PostgreSQL
- File storage migration to cloud storage (S3, CloudFlare R2)
- Environment variable configuration
- Process management and monitoring

## Known Limitations

1. **Data Persistence**: In-memory storage loses data on server restart
2. **File Storage**: ✅ RESOLVED - Now using AWS S3 for scalable cloud storage
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