/**
 * DevFlow Dashboard - Type Definitions
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

export type ProjectType = "client" | "personal" | "open_source"
export type ProjectStatus = "pending" | "in_progress" | "completed" | "delivered"
export type PaymentStatus = "unpaid" | "partial" | "paid"

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description?: string
  type: ProjectType
  status: ProjectStatus
  payment_status: PaymentStatus
  progress: number
  budget?: number
  paid_amount: number
  start_date?: string
  end_date?: string
  deadline?: string
  created_at: string
  updated_at: string
  clients?: Client[]
  tasks?: Task[]
  timeline?: ProjectTimeline[]
}

export interface Client {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description?: string
  completed: boolean
  priority: number
  due_date?: string
  created_at: string
  updated_at: string
}

export interface ProjectTimeline {
  id: string
  project_id: string
  milestone: string
  description?: string
  completed: boolean
  completed_at?: string
  order_index: number
  created_at: string
}

export interface ProjectClient {
  id: string
  project_id: string
  client_id: string
  reference_note?: string
  created_at: string
}
