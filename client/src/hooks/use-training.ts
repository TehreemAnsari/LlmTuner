import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TrainingJob, InsertTrainingJob } from "@shared/schema";

export function useTrainingJobs() {
  return useQuery<TrainingJob[]>({
    queryKey: ["/api/training-jobs"],
  });
}

export function useTrainingJob(id: number) {
  return useQuery<TrainingJob>({
    queryKey: ["/api/training-jobs", id],
    enabled: !!id,
  });
}

export function useCreateTrainingJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertTrainingJob) => {
      const response = await apiRequest("POST", "/api/training-jobs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-jobs"] });
    },
  });
}

export function useUpdateTrainingJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TrainingJob> }) => {
      const response = await apiRequest("PATCH", `/api/training-jobs/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-jobs", id] });
    },
  });
}

export function useStartTraining() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/training-jobs/${id}/start`);
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-jobs", id] });
    },
  });
}

export function usePauseTraining() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/training-jobs/${id}/pause`);
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-jobs", id] });
    },
  });
}

export function useStopTraining() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/training-jobs/${id}/stop`);
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-jobs", id] });
    },
  });
}

export function useUploadFiles() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ jobId, files }: { jobId: number; files: FileList }) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch(`/api/training-jobs/${jobId}/files`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-jobs", jobId, "files"] });
    },
  });
}

export function useTrainingLogs(jobId: number) {
  return useQuery({
    queryKey: ["/api/training-jobs", jobId, "logs"],
    enabled: !!jobId,
    refetchInterval: 2000, // Refetch every 2 seconds for live updates
  });
}

export function useEstimate() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/estimate", data);
      return response.json();
    },
  });
}
