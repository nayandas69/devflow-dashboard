/**
 * DevFlow Dashboard - Dashboard Overview Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FolderOpen, Clock, CheckCircle2, DollarSign, TrendingUp, Calendar, Users, ArrowRight } from "lucide-react"
import { ProjectCard } from "@/components/project-card"
import { EmptyState } from "@/components/empty-state"
import { CreateProjectModal } from "@/components/create-project-modal"
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
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Project } from "@/lib/types"
import Link from "next/link"

interface DashboardOverviewProps {
  initialProjects: Project[]
}

export function DashboardOverview({ initialProjects }: DashboardOverviewProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [viewProject, setViewProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Calculate statistics
  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === "in_progress").length
  const completedProjects = projects.filter((p) => p.status === "completed" || p.status === "delivered").length
  const totalRevenue = projects.filter((p) => p.type === "client").reduce((sum, p) => sum + (p.paid_amount || 0), 0)

  // Show only 6 most recent projects (smart sorted)
  const getRecentProjects = () => {
    const smartSorted = [...projects].sort((a, b) => {
      // Active projects first
      const aCompleted = a.status === "completed" || a.status === "delivered"
      const bCompleted = b.status === "completed" || b.status === "delivered"

      if (aCompleted && !bCompleted) return 1
      if (!aCompleted && bCompleted) return -1

      // Within same completion state, sort by most recent activity
      const aTime = new Date(a.updated_at || a.created_at).getTime()
      const bTime = new Date(b.updated_at || b.created_at).getTime()
      return bTime - aTime
    })

    return smartSorted.slice(0, 6) // Only show 6 recent projects
  }

  const recentProjects = getRecentProjects()

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      icon: FolderOpen,
      description: "All time projects",
      color: "text-blue-600",
    },
    {
      title: "Active Projects",
      value: activeProjects,
      icon: Clock,
      description: "Currently in progress",
      color: "text-yellow-600",
    },
    {
      title: "Completed",
      value: completedProjects,
      icon: CheckCircle2,
      description: "Successfully delivered",
      color: "text-green-600",
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Total earned",
      color: "text-purple-600",
    },
  ]

  const handleCreateProject = () => {
    setShowCreateModal(true)
  }

  const handleProjectCreated = () => {
    // Refresh the page to show the new project
    router.refresh()
  }

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
      setProjects(updatedProjects)
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
    setProjects(updatedProjects)
    setEditProject(null)
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <div className="flex items-center space-x-2">
            {projects.length > 6 && <Badge variant="secondary">{projects.length - 6} more</Badge>}
            <Link href="/dashboard/projects">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                onEdit={handleEditProject}
                onDelete={setDeleteProject}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Create your first project to get started with DevFlow."
            actionLabel="Create Project"
            onAction={handleCreateProject}
          />
        )}
      </div>

      {/* Quick Actions */}
      {projects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/projects">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Project Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">View detailed analytics and insights for your projects.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/projects">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Upcoming Deadlines</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Stay on top of your project deadlines and milestones.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/clients">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Client Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Manage your clients and their project requirements.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal open={showCreateModal} onOpenChange={setShowCreateModal} onSuccess={handleProjectCreated} />

      <EditProjectModal
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
        project={editProject}
        onSuccess={handleProjectUpdated}
      />

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
    </div>
  )
}
