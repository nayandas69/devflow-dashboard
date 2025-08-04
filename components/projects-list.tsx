/**
 * DevFlow Dashboard - Projects List Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import { useState } from "react"
import { ProjectCard } from "@/components/project-card"
import { EmptyState } from "@/components/empty-state"
import { EditProjectModal } from "@/components/edit-project-modal"
import { ViewProjectModal } from "@/components/view-project-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FolderOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Project } from "@/lib/types"

interface ProjectsListProps {
  projects: Project[]
  onProjectUpdate: (projects: Project[]) => void
  onProjectEdited?: (project: Project) => void
}

export function ProjectsList({ projects, onProjectUpdate, onProjectEdited }: ProjectsListProps) {
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [viewProject, setViewProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleEditProject = (project: Project) => {
    setEditProject(project)
  }

  const handleViewProject = (project: Project) => {
    setViewProject(project)
  }

  const handleDeleteProject = async () => {
    if (!deleteProject) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("projects").delete().eq("id", deleteProject.id)

      if (error) {
        console.error("Error deleting project:", error)
        toast.error("Failed to delete project")
        return
      }

      // Update the projects list
      const updatedProjects = projects.filter((p) => p.id !== deleteProject.id)
      onProjectUpdate(updatedProjects)
      toast.success("Project deleted successfully")
      setDeleteProject(null)
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("Failed to delete project")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleProjectUpdated = (updatedProject: Project) => {
    const updatedProjects = projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    onProjectUpdate(updatedProjects)

    // Notify parent about the edit for smart reordering
    if (onProjectEdited) {
      onProjectEdited(updatedProject)
    }

    setEditProject(null)
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Create your first project to get started with DevFlow."
      />
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onView={handleViewProject}
            onEdit={handleEditProject}
            onDelete={setDeleteProject}
          />
        ))}
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
        project={editProject}
        onSuccess={handleProjectUpdated}
      />

      {/* View Project Modal */}
      <ViewProjectModal
        open={!!viewProject}
        onOpenChange={(open) => !open && setViewProject(null)}
        project={viewProject}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProject?.title}"? This action cannot be undone and will also
              delete all associated tasks and timeline entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
