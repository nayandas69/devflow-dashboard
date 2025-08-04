/**
 * DevFlow Dashboard - Projects Page
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectsListWrapper } from "@/components/projects-list-wrapper"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { getProjects } from "@/lib/database"

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">Manage all your projects in one place.</p>
          </div>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <ProjectsListWrapper initialProjects={projects} />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
