/**
 * DevFlow Dashboard - Project List Wrapper Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import { useState, useMemo } from "react"
import { ProjectsList } from "@/components/projects-list"
import { CreateProjectModal } from "@/components/create-project-modal"
import { ProjectsSearchFilter, type ProjectFilters } from "@/components/projects-search-filter"
import { Pagination, PaginationInfo } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Project } from "@/lib/types"

interface ProjectsListWrapperProps {
  initialProjects: Project[]
}

const ITEMS_PER_PAGE = 12

export function ProjectsListWrapper({ initialProjects }: ProjectsListWrapperProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ProjectFilters>({
    search: "",
    types: [],
    statuses: [],
    paymentStatuses: [],
    sortBy: "smart",
    sortDirection: "desc",
  })

  // Smart auto-reordering function
  const getSmartOrderedProjects = (projectList: Project[]) => {
    return [...projectList].sort((a, b) => {
      const aCompleted = a.status === "completed" || a.status === "delivered"
      const bCompleted = b.status === "completed" || b.status === "delivered"

      if (aCompleted && !bCompleted) return 1
      if (!aCompleted && bCompleted) return -1

      const aTime = new Date(a.updated_at || a.created_at).getTime()
      const bTime = new Date(b.updated_at || b.created_at).getTime()
      return bTime - aTime
    })
  }

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchLower) ||
          (project.description && project.description.toLowerCase().includes(searchLower)),
      )
    }

    // Apply type filters
    if (filters.types.length > 0) {
      filtered = filtered.filter((project) => filters.types.includes(project.type))
    }

    // Apply status filters
    if (filters.statuses.length > 0) {
      filtered = filtered.filter((project) => filters.statuses.includes(project.status))
    }

    // Apply payment status filters
    if (filters.paymentStatuses.length > 0) {
      filtered = filtered.filter((project) => filters.paymentStatuses.includes(project.payment_status))
    }

    // Apply sorting
    if (filters.sortBy === "smart") {
      return getSmartOrderedProjects(filtered)
    }

    filtered.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "name":
          comparison = a.title.localeCompare(b.title)
          break
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case "progress":
          comparison = (a.progress || 0) - (b.progress || 0)
          break
        case "deadline":
          if (!a.deadline && !b.deadline) comparison = 0
          else if (!a.deadline) comparison = 1
          else if (!b.deadline) comparison = -1
          else comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          break
      }

      return filters.sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [projects, filters])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProjects.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProjects = filteredAndSortedProjects.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: ProjectFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleCreateProject = () => {
    setShowCreateModal(true)
  }

  const handleProjectCreated = (newProject: Project) => {
    const projectWithTimestamp = {
      ...newProject,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedProjects = getSmartOrderedProjects([projectWithTimestamp, ...projects])
    setProjects(updatedProjects)
    setShowCreateModal(false)
    setCurrentPage(1) // Go to first page to see new project
  }

  const handleProjectUpdate = (updatedProjects: Project[]) => {
    const smartOrderedProjects = getSmartOrderedProjects(updatedProjects)
    setProjects(smartOrderedProjects)
  }

  const handleProjectEdited = (editedProject: Project) => {
    const projectWithNewTimestamp = {
      ...editedProject,
      updated_at: new Date().toISOString(),
    }

    const updatedProjects = projects.map((p) => (p.id === editedProject.id ? projectWithNewTimestamp : p))
    const smartOrderedProjects = getSmartOrderedProjects(updatedProjects)
    setProjects(smartOrderedProjects)
    setCurrentPage(1) // Go to first page to see edited project
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <Button onClick={handleCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="space-y-6">
        <ProjectsSearchFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalCount={projects.length}
          filteredCount={filteredAndSortedProjects.length}
        />

        <ProjectsList
          projects={paginatedProjects}
          onProjectUpdate={handleProjectUpdate}
          onProjectEdited={handleProjectEdited}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <PaginationInfo
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedProjects.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <CreateProjectModal open={showCreateModal} onOpenChange={setShowCreateModal} onSuccess={handleProjectCreated} />
    </>
  )
}
