/**
 * DevFlow Dashboard - Database Operations
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

import { createClient as createSupabaseClient } from "./supabase/server"
import type { Project, Client, Profile } from "./types"

export async function getProjects(): Promise<Project[]> {
  const supabase = await createSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("No authenticated user found")
      return []
    }

    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        clients:project_clients(
          client:clients(*)
        ),
        tasks(*),
        timeline:project_timeline(*)
      `)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching projects:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getProjects:", error)
    return []
  }
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        clients:project_clients(
          client:clients(*)
        ),
        tasks(*),
        timeline:project_timeline(*)
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Error fetching project:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getProject:", error)
    return null
  }
}

export async function createProject(project: Partial<Project>): Promise<Project | null> {
  const supabase = await createSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const now = new Date().toISOString()
    const projectData = {
      ...project,
      user_id: user.id,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase.from("projects").insert(projectData).select().single()

    if (error) {
      console.error("Error creating project:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createProject:", error)
    return null
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const supabase = await createSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // Always update the updated_at timestamp when editing
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updatesWithTimestamp)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating project:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in updateProject:", error)
    return null
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = await createSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting project:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteProject:", error)
    return false
  }
}

export async function getClients(): Promise<Client[]> {
  const supabase = await createSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching clients:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getClients:", error)
    return []
  }
}

export async function createNewClient(client: Partial<Client>): Promise<Client | null> {
  const supabase = await createSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const clientData = {
      ...client,
      user_id: user.id,
    }

    const { data, error } = await supabase.from("clients").insert(clientData).select().single()

    if (error) {
      console.error("Error creating client:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createNewClient:", error)
    return null
  }
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getProfile:", error)
    return null
  }
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
  const supabase = await createSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

    if (error) {
      console.error("Error updating profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in updateProfile:", error)
    return null
  }
}
