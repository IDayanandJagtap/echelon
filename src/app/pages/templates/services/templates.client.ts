import { apiRequest } from "@/app/services/http";

export interface TemplateRecord {
  id: string;
  user_id?: string | null;
  name: string;
  description?: string | null;
  type: "predefined" | "customized";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateRuleRecord {
  id: string;
  template_id: string;
  star_level: number;
  title: string;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
}

interface ListResponse<T> {
  success: boolean;
  result?: T;
}

export async function fetchTemplates() {
  const response = await apiRequest<ListResponse<TemplateRecord[]>>("/templates");
  return response.result || [];
}

export async function createTemplate(input: { name: string; description?: string; isActive?: boolean }) {
  return apiRequest("/templates", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTemplate(input: { templateId: string; name?: string; description?: string; isActive?: boolean }) {
  return apiRequest("/templates", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteTemplate(templateId: string) {
  return apiRequest(`/templates?templateId=${templateId}`, {
    method: "DELETE",
  });
}

export async function cloneTemplate(templateId: string) {
  return apiRequest("/templates", {
    method: "POST",
    body: JSON.stringify({ action: "clone", templateId }),
  });
}

export async function activateTemplate(templateId: string) {
  return apiRequest("/templates/activate", {
    method: "POST",
    body: JSON.stringify({ templateId }),
  });
}

export async function fetchTemplateRules(templateId: string) {
  const response = await apiRequest<ListResponse<TemplateRuleRecord[]>>(`/templates/rules?templateId=${templateId}`);
  return response.result || [];
}

export async function createTemplateRule(input: {
  templateId: string;
  title: string;
  description?: string;
  starLevel: number;
  sortOrder?: number;
  isActive?: boolean;
}) {
  return apiRequest("/templates/rules", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTemplateRule(input: {
  ruleId: string;
  title?: string;
  description?: string;
  starLevel?: number;
  sortOrder?: number;
  isActive?: boolean;
}) {
  return apiRequest("/templates/rules", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteTemplateRule(ruleId: string) {
  return apiRequest(`/templates/rules?ruleId=${ruleId}`, {
    method: "DELETE",
  });
}
