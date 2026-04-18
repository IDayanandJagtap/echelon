import { apiRequest } from "@/app/services/http";

export interface RoadmapStep {
  date: string;
  topic: string;
  tasks: string[];
}

export interface RoadmapRecord {
  id: string;
  user_id?: string | null;
  title: string;
  created_by?: string | null;
  updated_by?: string | null;
  skill_level: number;
  months_allocated: number;
  hours_per_day: number;
  ai_response: RoadmapStep[];
  created_at?: string;
  updated_at?: string;
}

export interface RoadmapViewModel {
  id: string;
  userId?: string | null;
  title: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  skillLevel: number;
  monthsAllocated: number;
  hoursPerDay: number;
  plan: RoadmapStep[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoadmapPreviewInput {
  title: string;
  level: string | number;
  months: string | number;
  hoursPerDay: string | number;
}

export interface RoadmapPreviewResponse {
  result: {
    isFeasible?: boolean;
    reason?: string;
    title?: string;
    plan?: RoadmapStep[];
    estimatedMonths?: number;
    monthsAllocated?: number;
    hoursPerDay?: number;
    skillLevel?: number;
  };
}

export interface RoadmapSaveInput {
  title: string;
  skillLevel: number;
  monthsAllocated: number;
  hoursPerDay: number;
  aiResponse?: RoadmapStep[];
  plan?: RoadmapStep[];
}

function normalizeRoadmapRecord(record: RoadmapRecord): RoadmapViewModel {
  return {
    id: record.id,
    userId: record.user_id,
    title: record.title,
    createdBy: record.created_by,
    updatedBy: record.updated_by,
    skillLevel: record.skill_level,
    monthsAllocated: record.months_allocated,
    hoursPerDay: record.hours_per_day,
    plan: record.ai_response || [],
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function buildRoadmapPreviewPayload(input: RoadmapPreviewInput) {
  return {
    title: input.title,
    skillLevel: Number(input.level || 0),
    monthsAllocated: Number(input.months),
    hoursPerDay: Number(input.hoursPerDay),
    startDate: new Date().toISOString().split("T")[0],
  };
}

export async function fetchRoadmaps(userId: string) {
  const response = await apiRequest<{ result?: RoadmapRecord[] }>(`/ai/roadmap/get/${userId}`);
  return (response.result || []).map(normalizeRoadmapRecord);
}

export async function fetchRoadmap(userId: string, roadmapId: string) {
  const response = await apiRequest<{ result?: RoadmapRecord[] }>(`/ai/roadmap/get/${userId}/${roadmapId}`);
  return response.result?.[0] ? normalizeRoadmapRecord(response.result[0]) : null;
}

export async function generateRoadmapPreview(input: RoadmapPreviewInput) {
  const payload = buildRoadmapPreviewPayload(input);
  return apiRequest<RoadmapPreviewResponse>("/ai/roadmap/new", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function confirmRoadmap(input: RoadmapSaveInput) {
  return apiRequest("/ai/roadmap/confirm", {
    method: "POST",
    body: JSON.stringify({
      data: {
        ...input,
        aiResponse: input.aiResponse || input.plan,
      },
    }),
  });
}

export async function removeRoadmap(userId: string, roadmapId: string) {
  return apiRequest(`/ai/roadmap/delete/${userId}/${roadmapId}`, {
    method: "DELETE",
  });
}
