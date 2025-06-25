import { z } from "zod";

export const hyperparametersSchema = z.object({
  learning_rate: z.number().min(0.0001).max(0.01).default(0.001),
  batch_size: z.number().min(1).max(128).default(32),
  epochs: z.number().min(1).max(100).default(10),
  optimizer: z.enum(["adam", "adamw", "sgd"]).default("adam"),
  weight_decay: z.number().min(0).max(0.1).default(0.01),
  max_sequence_length: z.number().min(512).max(4096).default(2048),
});

export const uploadedFileSchema = z.object({
  originalName: z.string(),
  size: z.number(),
  type: z.string(),
  processedAt: z.string(),
  pythonScript: z.string(),
});

export const trainingRequestSchema = z.object({
  hyperparameters: hyperparametersSchema,
  files: z.array(z.string()),
});

export type Hyperparameters = z.infer<typeof hyperparametersSchema>;
export type UploadedFile = z.infer<typeof uploadedFileSchema>;
export type TrainingRequest = z.infer<typeof trainingRequestSchema>;