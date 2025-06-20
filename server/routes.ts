import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertTrainingJobSchema, insertTrainingFileSchema, hyperparametersSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/json', 'text/csv', 'text/plain'];
    const allowedExtensions = ['.json', '.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JSON, CSV, and TXT files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all training jobs
  app.get("/api/training-jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllTrainingJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch training jobs" });
    }
  });

  // Get specific training job
  app.get("/api/training-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getTrainingJob(id);
      if (!job) {
        return res.status(404).json({ message: "Training job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch training job" });
    }
  });

  // Create new training job
  app.post("/api/training-jobs", async (req, res) => {
    try {
      const validatedData = insertTrainingJobSchema.parse(req.body);
      const job = await storage.createTrainingJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create training job" });
    }
  });

  // Update training job
  app.patch("/api/training-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const job = await storage.updateTrainingJob(id, updates);
      if (!job) {
        return res.status(404).json({ message: "Training job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to update training job" });
    }
  });

  // Delete training job
  app.delete("/api/training-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTrainingJob(id);
      if (!success) {
        return res.status(404).json({ message: "Training job not found" });
      }
      
      // Clean up associated files and logs
      await storage.deleteTrainingLogsByJobId(id);
      const files = await storage.getTrainingFilesByJobId(id);
      for (const file of files) {
        await storage.deleteTrainingFile(file.id);
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete training job" });
    }
  });

  // Upload training files
  app.post("/api/training-jobs/:id/files", upload.array('files'), async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const job = await storage.getTrainingJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Training job not found" });
      }

      const uploadedFiles = [];
      for (const file of files) {
        const fileData = {
          jobId,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          type: path.extname(file.originalname).toLowerCase().substring(1)
        };
        
        const trainingFile = await storage.createTrainingFile(fileData);
        uploadedFiles.push(trainingFile);
      }

      res.status(201).json(uploadedFiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Get files for training job
  app.get("/api/training-jobs/:id/files", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const files = await storage.getTrainingFilesByJobId(jobId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Start training
  app.post("/api/training-jobs/:id/start", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getTrainingJob(id);
      if (!job) {
        return res.status(404).json({ message: "Training job not found" });
      }

      // Update job status to running
      const updatedJob = await storage.updateTrainingJob(id, { 
        status: "running", 
        progress: 0 
      });

      // Create initial log entry
      await storage.createTrainingLog({
        jobId: id,
        message: "Training job started",
        level: "info"
      });

      // Simulate training progress (in a real app, this would be handled by a queue system)
      simulateTraining(id);

      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Failed to start training" });
    }
  });

  // Pause training
  app.post("/api/training-jobs/:id/pause", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.updateTrainingJob(id, { status: "paused" });
      if (!job) {
        return res.status(404).json({ message: "Training job not found" });
      }

      await storage.createTrainingLog({
        jobId: id,
        message: "Training job paused",
        level: "info"
      });

      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to pause training" });
    }
  });

  // Stop training
  app.post("/api/training-jobs/:id/stop", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.updateTrainingJob(id, { status: "idle" });
      if (!job) {
        return res.status(404).json({ message: "Training job not found" });
      }

      await storage.createTrainingLog({
        jobId: id,
        message: "Training job stopped",
        level: "warning"
      });

      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to stop training" });
    }
  });

  // Get training logs
  app.get("/api/training-jobs/:id/logs", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const logs = await storage.getTrainingLogsByJobId(jobId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Estimate cost and time
  app.post("/api/estimate", async (req, res) => {
    try {
      const { baseModel, taskType, hyperparameters, dataSize } = req.body;
      
      // Simple estimation logic (in a real app, this would be more sophisticated)
      const baseTime = dataSize ? Math.ceil(dataSize / 1000) : 30; // minutes
      const timeFactor = hyperparameters?.epochs || 3;
      const estimatedTime = `~${baseTime * timeFactor}min`;
      
      const baseCost = baseModel === 'gpt-4' ? 50 : 25;
      const costFactor = (hyperparameters?.epochs || 3) * (hyperparameters?.batchSize || 16) / 16;
      const estimatedCost = (baseCost * costFactor).toFixed(2);
      
      const totalTokens = dataSize ? Math.ceil(dataSize * 0.75) : 125; // rough estimate

      res.json({
        estimatedCost: `$${estimatedCost}`,
        estimatedTime,
        totalTokens: `${totalTokens}K`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to estimate cost and time" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simulate training progress (in a real app, this would be handled by a proper job queue)
function simulateTraining(jobId: number) {
  let progress = 0;
  let step = 0;
  const totalSteps = 500;
  
  const interval = setInterval(async () => {
    progress += Math.random() * 3;
    step += Math.floor(Math.random() * 10) + 5;
    
    if (progress > 100) progress = 100;
    if (step > totalSteps) step = totalSteps;
    
    // Update job progress
    await storage.updateTrainingJob(jobId, { 
      progress: Math.floor(progress),
      metrics: {
        currentStep: step,
        totalSteps,
        loss: (0.5 - (progress / 200)).toFixed(3),
        accuracy: Math.min(95, 85 + (progress / 10)).toFixed(1),
        learningRate: (5e-4 * (1 - progress / 200)).toExponential(1),
        throughput: (2000 + Math.random() * 200).toFixed(0)
      }
    });

    // Add training logs periodically
    if (step % 100 === 0 || progress >= 100) {
      const loss = (0.5 - (progress / 200)).toFixed(3);
      await storage.createTrainingLog({
        jobId,
        message: `Epoch ${Math.ceil(step / 167)}/3 - Step ${step}/${totalSteps} - Loss: ${loss}`,
        level: "info"
      });
    }
    
    if (progress >= 100) {
      await storage.updateTrainingJob(jobId, { 
        status: "completed",
        metrics: {
          ...await storage.getTrainingJob(jobId).then(job => job?.metrics || {}),
          bleu: "0.847",
          rouge: "0.792",
          perplexity: "12.3",
          f1: "0.913"
        }
      });
      
      await storage.createTrainingLog({
        jobId,
        message: "Training completed successfully",
        level: "info"
      });
      
      clearInterval(interval);
    }
  }, 2000);
}
