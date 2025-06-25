# LLM Tuner Platform - Complete Local Setup Guide

## Step 1: Environment Setup

### Install Prerequisites

#### Node.js and npm
```bash
# Option A: Download from official website
# Visit https://nodejs.org/ and download Node.js 18+ LTS version

# Option B: Using package managers
# macOS (using Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows (using Chocolatey)
choco install nodejs

# Verify installation
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

#### Python
```bash
# Option A: Download from official website
# Visit https://python.org/ and download Python 3.8+ 

# Option B: Using package managers
# macOS (using Homebrew)
brew install python

# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip

# Windows (using Chocolatey)
choco install python

# Verify installation
python --version   # Should show 3.8+ (or python3 --version on some systems)
pip --version      # Should show pip version
```

## Step 2: Project Setup

### Create Project Directory
```bash
# Create and navigate to project directory
mkdir llm-tuner-platform
cd llm-tuner-platform

# Initialize git repository (optional)
git init
```

### Download Project Files
```bash
# If you have the project as a zip file, extract it
# Or copy all project files to this directory

# Create necessary directories
mkdir -p client/src/{components,hooks,lib,pages}
mkdir -p server
mkdir -p shared
mkdir uploads
```

### Initialize Node.js Project
```bash
# Create package.json
npm init -y

# Install all dependencies at once
npm install @hookform/resolvers @neondatabase/serverless @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip @tailwindcss/typography @tailwindcss/vite @tanstack/react-query class-variance-authority clsx cmdk date-fns embla-carousel-react express express-session framer-motion input-otp lucide-react multer next-themes react react-day-picker react-dom react-hook-form react-icons react-resizable-panels recharts tailwind-merge tailwindcss tailwindcss-animate vaul wouter zod

# Install development dependencies
npm install -D @types/express @types/express-session @types/multer @types/node @types/react @types/react-dom @vitejs/plugin-react autoprefixer esbuild postcss tsx typescript vite
```

## Step 3: Configuration Files

### Create package.json scripts
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsc && vite build",
    "start": "node dist/server/index.js",
    "type-check": "tsc --noEmit"
  }
}
```

### Create TypeScript Configuration
```bash
# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  },
  "include": ["client/src", "server", "shared", "vite.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
```

### Create Vite Configuration
```bash
# Create vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
EOF
```

### Create Tailwind Configuration
```bash
# Create tailwind.config.ts
cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx,mdx}",
    "./client/index.html",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
EOF
```

### Create PostCSS Configuration
```bash
# Create postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF
```

## Step 4: Copy Project Files

### Copy All Source Files
Copy these files from the Replit project to your local directory:

**Main Files:**
- `gpt2_tuning.py` (root directory)
- `client/src/` (entire directory with all components)
- `server/` (entire directory)
- `shared/` (entire directory)
- `client/index.html`

**Configuration Files:**
- `components.json`
- Any other config files from the project

## Step 5: Start the Application

### Development Mode
```bash
# Start the development server
npm run dev

# This will:
# 1. Start Express server on port 3001 (or PORT environment variable)
# 2. Create gpt2_tuning.py automatically
# 3. Handle file uploads and Python script execution
```

### Alternative Port (if still getting conflicts)
```bash
# Use a specific port
PORT=3002 npm run dev

# Or kill existing processes using port 5000
lsof -ti:5000 | xargs kill -9
npm run dev
```

### Open in Browser
```bash
# Navigate to:
http://localhost:3001

# The application should load with:
# - File upload interface
# - Hyperparameters section
# - Working GPT-2 script integration
```

## Step 6: Test the Setup

### Upload a Test File
1. Create a test file:
```bash
cat > test.txt << 'EOF'
This is line 1 of test content for GPT-2 tuning.
This is line 2 with more sample text for processing.
This is line 3 demonstrating dataset preparation.
This is line 4 showing the logging functionality.
This is line 5 completing the test dataset.
EOF
```

2. Upload through the web interface
3. Check terminal for GPT-2 script output with first 5 samples

### Expected Output
You should see logs like:
```
=== GPT-2 Fine-tuning with Uploaded Data ===
File: test.txt
Type: .txt
Processing file content of type: .txt
Content length: 245 characters
Prepared 5 text samples for training

=== First 5 Dataset Samples ===
Sample 1: This is line 1 of test content for GPT-2 tuning...
Sample 2: This is line 2 with more sample text for processing...
Sample 3: This is line 3 demonstrating dataset preparation...
Sample 4: This is line 4 showing the logging functionality...
Sample 5: This is line 5 completing the test dataset...
===============================

Loading GPT-2 model and tokenizer...
Training completed successfully!
```

## Step 7: Optional Enhancements

### Add Python ML Libraries (Optional)
```bash
# Create Python virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install ML libraries
pip install transformers datasets torch numpy pandas

# This enables actual ML functionality beyond simulation
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: 
   - If you get "EADDRINUSE" error, kill the process using the port:
   ```bash
   # Find process using port 5000 (or 3001)
   lsof -ti:5000 | xargs kill -9
   # Or use a different port by setting environment variable
   PORT=3001 npm run dev
   ```
2. **Permission errors**: Ensure uploads/ directory has write permissions
3. **Python not found**: Verify Python is in PATH or use full python path
4. **Module errors**: Run `npm install` to ensure all dependencies are installed

### Verify Setup
```bash
# Check if all services are running
curl http://localhost:3001/api/health  # Should return server status
```

Your LLM Tuner platform is now ready for local development with full file upload, dataset processing, and GPT-2 script integration functionality!