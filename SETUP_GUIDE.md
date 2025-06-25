# LLM Tuner Platform - Complete Setup Guide

This guide provides step-by-step instructions to run the LLM Tuner platform locally on your machine.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 9.0.0 or higher) or **yarn**
- **Git** for cloning the repository
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output v18.0.0 or higher

# Check npm version
npm --version
# Should output 9.0.0 or higher

# Check Git
git --version
# Should output Git version information
```

## Step-by-Step Setup Instructions

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd llm-tuner
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install

# This will install both frontend and backend dependencies
# The process should complete without errors
```

### Step 3: Create Required Directories

```bash
# Create the uploads directory for file storage
mkdir uploads

# Verify the directory was created
ls -la uploads
```

### Step 4: Start the Development Server

```bash
# Start the development server
npm run dev
```

You should see output similar to:
```
> rest-express@1.0.0 dev
> NODE_ENV=development tsx server/index.ts

[express] serving on port 5000
[vite] connecting...
[vite] connected.
```

### Step 5: Access the Application

1. Open your web browser
2. Navigate to `http://localhost:5000`
3. You should see the LLM Tuner dashboard

## Detailed Code Flow Explanation

### Application Startup Flow

#### 1. Server Initialization (`server/index.ts`)

```typescript
// Server starts on port 5000
const server = app.listen(PORT, "0.0.0.0", () => {
  log(`serving on port ${PORT}`, "express");
});
```

**What happens:**
- Express server initializes with middleware (CORS, JSON parsing, sessions)
- API routes are registered from `server/routes.ts`
- Vite development server is set up for frontend assets
- Server binds to all interfaces (0.0.0.0) on port 5000

#### 2. Frontend Bootstrap (`client/src/main.tsx`)

```typescript
ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**What happens:**
- React application mounts to the DOM
- QueryClient provider wraps the app for data fetching
- Tooltip and Toast providers initialize for UI feedback
- Router component loads with route definitions

### User Interaction Flow

#### 3. Dashboard Loading (`client/src/pages/dashboard.tsx`)

```typescript
const { data: jobs, isLoading } = useTrainingJobs();
```

**What happens:**
- Component renders and triggers `useTrainingJobs` hook
- Hook makes GET request to `/api/training-jobs`
- Server returns empty array initially `[]`
- UI renders with "No training jobs yet" message

#### 4. Creating a Training Job

**User Action:** Clicks "New Training Job" button

**Code Flow:**
1. **Frontend** (`client/src/components/sidebar.tsx`):
   ```typescript
   const createJob = useCreateTrainingJob();
   await createJob.mutateAsync({
     name: newJobName,
     baseModel: "",
     taskType: "",
     status: "idle",
     // ... other default values
   });
   ```

2. **API Request** to `POST /api/training-jobs`

3. **Server Handler** (`server/routes.ts`):
   ```typescript
   const validatedData = insertTrainingJobSchema.parse(req.body);
   const job = await storage.createTrainingJob(validatedData);
   ```

4. **Storage Layer** (`server/storage.ts`):
   ```typescript
   const id = this.currentJobId++;
   const job = { ...insertJob, id, createdAt: now, updatedAt: now };
   this.trainingJobs.set(id, job);
   ```

5. **Response:** New job object returned to frontend
6. **UI Update:** Job appears in sidebar, gets auto-selected

#### 5. File Upload Process

**User Action:** Drags files to upload area

**Code Flow:**
1. **File Validation** (`client/src/components/file-upload.tsx`):
   ```typescript
   const validFiles = Array.from(files).filter(file => {
     const validTypes = ['application/json', 'text/csv', 'text/plain'];
     return validTypes.includes(file.type);
   });
   ```

2. **Upload Request** (`client/src/hooks/use-training.ts`):
   ```typescript
   const formData = new FormData();
   Array.from(files).forEach(file => {
     formData.append('files', file);
   });
   ```

3. **Server Processing** (`server/routes.ts`):
   ```typescript
   app.post("/api/training-jobs/:id/files", upload.array('files'), async (req, res) => {
     const files = req.files as Express.Multer.File[];
     // Process each file and store metadata
   });
   ```

4. **Multer Middleware:** Saves files to `uploads/` directory
5. **File Metadata:** Stored in memory with job association

#### 6. Model and Hyperparameter Configuration

**User Action:** Selects model and adjusts hyperparameters

**Code Flow:**
1. **Model Selection** (`client/src/components/model-selection.tsx`):
   ```typescript
   const handleModelChange = (value: string) => {
     updateJob.mutate({ id: selectedJobId, data: { baseModel: value } });
   };
   ```

2. **Hyperparameter Updates** (`client/src/components/hyperparameters.tsx`):
   ```typescript
   const updateHyperparameter = (key: keyof Hyperparameters, value: number) => {
     const newHyperparams = { ...hyperparams, [key]: value };
     updateJob.mutate({ id: selectedJobId, data: { hyperparameters: newHyperparams } });
   };
   ```

3. **Cost Estimation:**
   ```typescript
   estimate.mutate({
     baseModel: job.baseModel,
     taskType: job.taskType,
     hyperparameters: hyperparams,
     dataSize: 1000
   });
   ```

#### 7. Training Execution

**User Action:** Clicks "Start Training"

**Code Flow:**
1. **Training Start** (`client/src/components/training-progress.tsx`):
   ```typescript
   await startTraining.mutateAsync(selectedJobId);
   ```

2. **Server Handler** (`server/routes.ts`):
   ```typescript
   const updatedJob = await storage.updateTrainingJob(id, { 
     status: "running", 
     progress: 0 
   });
   simulateTraining(id); // Start background simulation
   ```

3. **Training Simulation** (`server/routes.ts`):
   ```typescript
   function simulateTraining(jobId: number) {
     const interval = setInterval(async () => {
       progress += Math.random() * 3;
       // Update job progress and metrics
       await storage.updateTrainingJob(jobId, { 
         progress: Math.floor(progress),
         metrics: { /* calculated metrics */ }
       });
     }, 2000);
   }
   ```

4. **Real-time Updates:**
   - Frontend polls every 2 seconds via TanStack Query
   - Progress bar updates automatically
   - Training logs stream to console interface
   - Metrics display updates in real-time

### Data Flow Architecture

```
User Input → React Component → Custom Hook → TanStack Query → API Request
    ↓
Express Route → Zod Validation → Storage Layer → In-Memory Storage
    ↓
Response Data → Query Cache → React Re-render → UI Update
```

## Common Operations Walkthrough

### Creating Your First Training Job

1. **Start the application** following setup steps above
2. **Open browser** to `http://localhost:5000`
3. **Click "New Training Job"** in the sidebar
4. **Enter a job name** (e.g., "My First LLM Training")
5. **Click "Create Job"** - job appears in sidebar with "idle" status

### Configuring Training Parameters

1. **Select your created job** from the sidebar
2. **Upload training data:**
   - Drag JSON/CSV/TXT files to upload area
   - Or click "Customer Support" sample dataset
   - Click "Upload Files" button
3. **Choose base model:**
   - Select "GPT-3.5 Turbo" from dropdown
   - Note the model information displayed
4. **Select task type:**
   - Choose "Text Generation" from dropdown
5. **Adjust hyperparameters:**
   - Use sliders to modify learning rate, batch size, epochs
   - Watch cost estimation update in real-time
   - Click "Auto-Configure" for task-optimized settings

### Running Training

1. **Start training:**
   - Click "Start Training" button
   - Status changes to "running"
   - Progress bar begins updating
2. **Monitor progress:**
   - Watch real-time metrics (loss, accuracy, learning rate)
   - View training logs in console area
   - Progress updates every 2 seconds
3. **Training completion:**
   - Progress reaches 100%
   - Status changes to "completed"
   - Export options become available

## Troubleshooting Common Issues

### Port Already in Use
```bash
# Kill process using port 5000
sudo lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

### Module Not Found Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### File Upload Issues
```bash
# Ensure uploads directory exists
mkdir -p uploads
chmod 755 uploads
```

### TypeScript Compilation Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Clear cache if needed
rm -rf node_modules/.cache
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking only
npm run type-check

# Install new dependency
npm install <package-name>

# Install dev dependency
npm install -D <package-name>
```

## Project Structure Quick Reference

```
llm-tuner/
├── client/src/
│   ├── components/     # UI components
│   ├── hooks/         # React hooks
│   ├── pages/         # Page components
│   └── lib/           # Utilities
├── server/            # Backend API
├── shared/            # Shared types
└── uploads/           # File storage
```

## Next Steps

After successfully running the application:

1. **Explore the interface** - Create multiple training jobs
2. **Test file uploads** - Try different file formats
3. **Experiment with models** - Compare different base models
4. **Monitor training** - Watch the simulation progress
5. **Review code** - Examine the implementation details

For production deployment, refer to the deployment section in the main README.md file.

## Getting Help

If you encounter issues:
1. Check this troubleshooting guide
2. Review the browser console for errors
3. Check the server logs in your terminal
4. Verify all prerequisites are met
5. Ensure all dependencies installed correctly

The application should now be running successfully on your local machine!