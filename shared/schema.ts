import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trainingJobs = pgTable("training_jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  baseModel: text("base_model").notNull(),
  taskType: text("task_type").notNull(),
  status: text("status").notNull().default("idle"), // idle, running, paused, completed, failed
  progress: integer("progress").notNull().default(0), // 0-100
  hyperparameters: jsonb("hyperparameters").notNull(),
  metrics: jsonb("metrics").default({}),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  estimatedTime: text("estimated_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trainingFiles = pgTable("training_files", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => trainingJobs.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(), // json, csv, txt
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const trainingLogs = pgTable("training_logs", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => trainingJobs.id).notNull(),
  message: text("message").notNull(),
  level: text("level").notNull().default("info"), // info, warning, error
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertTrainingJobSchema = createInsertSchema(trainingJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingFileSchema = createInsertSchema(trainingFiles).omit({
  id: true,
  uploadedAt: true,
});

export const insertTrainingLogSchema = createInsertSchema(trainingLogs).omit({
  id: true,
  timestamp: true,
});

export const hyperparametersSchema = z.object({
  learningRate: z.number().min(1e-6).max(1e-2).default(5e-4),
  batchSize: z.number().int().min(1).max(64).default(16),
  epochs: z.number().int().min(1).max(10).default(3),
  warmupSteps: z.number().int().min(0).max(1000).default(100),
  weightDecay: z.number().min(0).max(1).default(0.01),
  maxLength: z.number().int().default(2048),
});

export type InsertTrainingJob = z.infer<typeof insertTrainingJobSchema>;
export type TrainingJob = typeof trainingJobs.$inferSelect;
export type InsertTrainingFile = z.infer<typeof insertTrainingFileSchema>;
export type TrainingFile = typeof trainingFiles.$inferSelect;
export type InsertTrainingLog = z.infer<typeof insertTrainingLogSchema>;
export type TrainingLog = typeof trainingLogs.$inferSelect;
export type Hyperparameters = z.infer<typeof hyperparametersSchema>;
