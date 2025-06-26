import { Express } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { hyperparametersSchema } from "../shared/schema";
import { tuner_trigger, generateTrainingScript as generateTuningTrainingScript } from "./tuner";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.json', '.csv', '.txt', '.jsonl'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JSON, CSV, TXT, and JSONL files are allowed."));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export function registerRoutes(app: Express) {
  // File upload endpoint
  app.post("/api/upload", upload.array('files'), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const processedFiles = [];

      for (const file of files) {
        const filePath = file.path;
        const originalName = file.originalname;
        const ext = path.extname(originalName).toLowerCase();

        // Read file content (dataset)
        let content: string;
        let parsedData: any = null;
        
        try {
          content = fs.readFileSync(filePath, 'utf-8');
          
          // Parse content based on file type
          if (ext === '.json') {
            parsedData = JSON.parse(content);
            console.log(`📄 ${originalName}: JSON with ${Array.isArray(parsedData) ? parsedData.length : 1} records`);
          } else if (ext === '.csv') {
            const lines = content.split('\n').filter(line => line.trim());
            console.log(`📄 ${originalName}: CSV with ${lines.length} lines`);
          } else if (ext === '.jsonl') {
            const lines = content.split('\n').filter(line => line.trim());
            const validJson = lines.filter(line => {
              try { JSON.parse(line); return true; } catch { return false; }
            });
            console.log(`📄 ${originalName}: JSONL with ${validJson.length} valid JSON lines`);
          } else {
            const lines = content.split('\n').filter(line => line.trim());
            console.log(`📄 ${originalName}: Text file with ${lines.length} lines`);
          }
        } catch (error) {
          console.error(`❌ Error reading ${originalName}:`, error);
          content = '';
        }
        
        // Just save content for later training - no GPT-2 execution during upload
        const contentPath = path.join("uploads", `content_${Date.now()}_${originalName.replace(/\.[^/.]+$/, "")}.txt`);
        fs.writeFileSync(contentPath, content);
        
        const tuningInfo = {
          tuningScript: "gpt2_tuning.py",
          contentFile: contentPath,
          fileName: originalName,
          fileType: ext
        };

        processedFiles.push({
          originalName,
          size: file.size,
          type: ext,
          processedAt: new Date().toISOString(),
          tuningInfo: tuningInfo,
          contentPreview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
        });
      }

      res.json({
        message: "Files uploaded and processed successfully",
        files: processedFiles
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to process uploaded files" });
    }
  });

  // Start training endpoint
  app.post("/api/start-training", async (req, res) => {
    try {
      const { hyperparameters, files } = req.body;
      
      // Validate hyperparameters
      const validatedParams = hyperparametersSchema.parse(hyperparameters);
      
      console.log(`🎯 Starting training with hyperparameters:`, validatedParams);
      console.log(`📂 Training files:`, files);
      
      // Find uploaded files and trigger training with hyperparameters
      const processedFiles = [];
      
      for (const fileName of files) {
        // Find the corresponding uploaded file content
        const uploadsDir = "uploads";
        const contentFiles = fs.readdirSync(uploadsDir)
          .filter(file => file.includes(fileName.replace(/\.[^/.]+$/, "")))
          .filter(file => file.startsWith("content_"));
        
        if (contentFiles.length > 0) {
          const contentFile = path.join(uploadsDir, contentFiles[0]);
          const content = fs.readFileSync(contentFile, 'utf-8');
          const ext = path.extname(fileName).toLowerCase();
          
          console.log(`🔥 Triggering training for ${fileName} with hyperparameters`);
          
          // Call tuner_trigger with hyperparameters
          const tuningInfo = tuner_trigger({
            fileName: fileName,
            fileType: ext,
            content: content,
            parsedData: validatedParams  // Pass hyperparameters as parsedData
          });
          
          processedFiles.push({
            fileName,
            tuningInfo: JSON.parse(tuningInfo)
          });
        } else {
          console.log(`⚠️ No content file found for ${fileName}`);
        }
      }

      res.json({
        message: "Training started successfully with hyperparameters",
        hyperparameters: validatedParams,
        files: processedFiles
      });
    } catch (error) {
      console.error("Training error:", error);
      res.status(400).json({ error: "Failed to start training" });
    }
  });

  // Get uploaded files
  app.get("/api/files", (req, res) => {
    try {
      const uploadsDir = "uploads";
      if (!fs.existsSync(uploadsDir)) {
        return res.json({ files: [] });
      }

      const files = fs.readdirSync(uploadsDir)
        .filter(file => !file.endsWith('.py'))
        .map(file => {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            uploadedAt: stats.ctime.toISOString()
          };
        });

      res.json({ files });
    } catch (error) {
      console.error("Files error:", error);
      res.status(500).json({ error: "Failed to retrieve files" });
    }
  });
}

