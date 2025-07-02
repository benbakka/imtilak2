export type UserRole = 'admin' | 'project_manager' | 'team_leader' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company_id: string;
  company?: {
    id: string;
    name: string;
  };
  created_at: string;
  phone?: string;
  position?: string;
}

export interface Company {
  id: string;
  name: string;
  created_at: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface Project {
  id: string;
  name: string;
  company_id: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  progress: number;
  created_at: string;
  description?: string;
  budget?: number;
  unit_count?: number;
  active_team_count?: number;
}

export interface Unit {
  id: string;
  project_id: string;
  name: string;
  type: 'villa' | 'apartment' | 'commercial';
  floor?: string | null;
  area?: number | null;
  created_at: string;
  description?: string | null;
  progress?: number;
  project?: Project;
}

export interface Category {
  id: string;
  unit_id: string;
  name: string;
  start_date: string;
  end_date: string;
  order: number;
  created_at: string;
  description?: string;
  progress?: number;
  unit?: Unit;
  categoryTeams?: CategoryTeam[];
}

export interface Team {
  id: string;
  name: string;
  specialty: string;
  company_id: string;
  color: string;
  created_at: string;
  description?: string;
  is_active?: boolean;
}

export interface CategoryTeam {
  id: string;
  category_id: string;
  team_id: string;
  status: 'not_started' | 'in_progress' | 'done' | 'delayed';
  reception_status: boolean;
  payment_status: boolean;
  notes: string;
  tasks: string[];
  created_at: string;
  team?: Team;
  category?: Category;
  progressPercentage?: number;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  category_team_id: string;
  due_date: string;
  created_at: string;
  progress?: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'delay' | 'deadline' | 'completion' | 'payment';
  category_team_id: string;
  read: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  category_team_id: string;
  amount: number;
  paid: boolean;
  due_date: string;
  created_at: string;
}

export interface FileUpload {
  id: string;
  filename: string;
  url: string;
  type: 'photo' | 'document';
  category_team_id: string;
  uploaded_by: string;
  created_at: string;
}

// Template interfaces for unit templates and cloning
export interface UnitTemplate {
  id: string;
  name: string;
  description: string;
  unit_type: 'villa' | 'apartment' | 'commercial';
  company_id: string;
  categories: TemplateCategory[];
  created_at: string;
}

export interface TemplateCategory {
  id: string;
  template_id: string;
  name: string;
  order: number;
  duration_days: number;
  teams: TemplateCategoryTeam[];
  created_at: string;
}

export interface TemplateCategoryTeam {
  id: string;
  template_category_id: string;
  team_id: string;
  tasks: string[];
  notes: string;
  created_at: string;
}