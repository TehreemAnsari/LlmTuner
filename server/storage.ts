import { 
  trainingJobs, 
  trainingFiles, 
  trainingLogs,
  type TrainingJob, 
  type InsertTrainingJob,
  type TrainingFile,
  type InsertTrainingFile,
  type TrainingLog,
  type InsertTrainingLog
} from "@shared/schema";

export interface IStorage {
  // Training Jobs
  createTrainingJob(job: InsertTrainingJob): Promise<TrainingJob>;
  getTrainingJob(id: number): Promise<TrainingJob | undefined>;
  getAllTrainingJobs(): Promise<TrainingJob[]>;
  updateTrainingJob(id: number, updates: Partial<TrainingJob>): Promise<TrainingJob | undefined>;
  deleteTrainingJob(id: number): Promise<boolean>;
  
  // Training Files
  createTrainingFile(file: InsertTrainingFile): Promise<TrainingFile>;
  getTrainingFilesByJobId(jobId: number): Promise<TrainingFile[]>;
  deleteTrainingFile(id: number): Promise<boolean>;
  
  // Training Logs
  createTrainingLog(log: InsertTrainingLog): Promise<TrainingLog>;
  getTrainingLogsByJobId(jobId: number): Promise<TrainingLog[]>;
  deleteTrainingLogsByJobId(jobId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private trainingJobs: Map<number, TrainingJob>;
  private trainingFiles: Map<number, TrainingFile>;
  private trainingLogs: Map<number, TrainingLog>;
  private currentJobId: number;
  private currentFileId: number;
  private currentLogId: number;

  constructor() {
    this.trainingJobs = new Map();
    this.trainingFiles = new Map();
    this.trainingLogs = new Map();
    this.currentJobId = 1;
    this.currentFileId = 1;
    this.currentLogId = 1;
  }

  async createTrainingJob(insertJob: InsertTrainingJob): Promise<TrainingJob> {
    const id = this.currentJobId++;
    const now = new Date();
    const job: TrainingJob = { 
      ...insertJob, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.trainingJobs.set(id, job);
    return job;
  }

  async getTrainingJob(id: number): Promise<TrainingJob | undefined> {
    return this.trainingJobs.get(id);
  }

  async getAllTrainingJobs(): Promise<TrainingJob[]> {
    return Array.from(this.trainingJobs.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateTrainingJob(id: number, updates: Partial<TrainingJob>): Promise<TrainingJob | undefined> {
    const job = this.trainingJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { 
      ...job, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.trainingJobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteTrainingJob(id: number): Promise<boolean> {
    return this.trainingJobs.delete(id);
  }

  async createTrainingFile(insertFile: InsertTrainingFile): Promise<TrainingFile> {
    const id = this.currentFileId++;
    const file: TrainingFile = { 
      ...insertFile, 
      id, 
      uploadedAt: new Date()
    };
    this.trainingFiles.set(id, file);
    return file;
  }

  async getTrainingFilesByJobId(jobId: number): Promise<TrainingFile[]> {
    return Array.from(this.trainingFiles.values()).filter(file => file.jobId === jobId);
  }

  async deleteTrainingFile(id: number): Promise<boolean> {
    return this.trainingFiles.delete(id);
  }

  async createTrainingLog(insertLog: InsertTrainingLog): Promise<TrainingLog> {
    const id = this.currentLogId++;
    const log: TrainingLog = { 
      ...insertLog, 
      id, 
      timestamp: new Date()
    };
    this.trainingLogs.set(id, log);
    return log;
  }

  async getTrainingLogsByJobId(jobId: number): Promise<TrainingLog[]> {
    return Array.from(this.trainingLogs.values())
      .filter(log => log.jobId === jobId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async deleteTrainingLogsByJobId(jobId: number): Promise<boolean> {
    const logs = Array.from(this.trainingLogs.entries()).filter(([_, log]) => log.jobId === jobId);
    logs.forEach(([id]) => this.trainingLogs.delete(id));
    return true;
  }
}

export const storage = new MemStorage();
