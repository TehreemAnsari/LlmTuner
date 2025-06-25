# How to Download LLM Tuner Project from Replit

## Problem: Replit Download Issues
Replit's download feature sometimes fails with large projects or when node_modules is included.

## Solution 1: Create New Local Project

### Step 1: Create Project Structure
```bash
mkdir llm-tuner
cd llm-tuner
mkdir -p client/src/{components/ui,hooks,lib,pages}
mkdir -p server shared uploads
```

### Step 2: Initialize Project
```bash
npm init -y
```

### Step 3: Install Dependencies
```bash
npm install @hookform/resolvers @jridgewell/trace-mapping @neondatabase/serverless @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip @replit/vite-plugin-cartographer @replit/vite-plugin-runtime-error-modal @tailwindcss/typography @tailwindcss/vite @tanstack/react-query @types/connect-pg-simple @types/express @types/express-session @types/multer @types/node @types/passport @types/passport-local @types/react @types/react-dom @types/ws @vitejs/plugin-react autoprefixer class-variance-authority clsx cmdk connect-pg-simple date-fns drizzle-kit drizzle-orm drizzle-zod embla-carousel-react esbuild express express-session framer-motion input-otp lucide-react memorystore multer next-themes passport passport-local postcss react react-day-picker react-dom react-hook-form react-icons react-resizable-panels recharts tailwind-merge tailwindcss tailwindcss-animate tsx tw-animate-css typescript vaul vite wouter ws zod zod-validation-error
```

## Solution 2: Copy Files Manually

Since download is failing, copy each file from Replit's file explorer:

### Essential Files to Copy:
1. **package.json** - Dependencies and scripts
2. **tsconfig.json** - TypeScript configuration  
3. **tailwind.config.ts** - Styling configuration
4. **vite.config.ts** - Build configuration
5. **postcss.config.js** - CSS processing
6. **components.json** - UI components config
7. **All files in client/src/** - Frontend code
8. **All files in server/** - Backend code
9. **shared/schema.ts** - Shared types
10. **Documentation files** - README.md, etc.

### Don't Copy:
- node_modules/ (reinstall with npm install)
- .git/ (version control)
- uploads/ (empty directory)
- .cache/, .local/, .upm/ (Replit-specific)

## Solution 3: Fork the Replit

1. Click "Fork" in Replit to create your own copy
2. Work directly in your forked version
3. Use Git to sync with external repository

## Solution 4: Use Git

If you have Git configured:
```bash
git clone <replit-git-url>
```

## Quick Start After Manual Setup

1. Copy all source files to your local structure
2. Run: `npm install`
3. Create uploads directory: `mkdir uploads`
4. Start development: `npm run dev`
5. Access at: `http://localhost:5000`

## File Priority Order

Copy in this order for fastest setup:
1. package.json (install dependencies first)
2. Configuration files (tsconfig, tailwind, vite)
3. shared/schema.ts (type definitions)
4. server/ files (backend API)
5. client/src/ files (frontend)
6. Documentation files

This approach ensures you get a working copy even if Replit's download fails.