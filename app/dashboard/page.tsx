/**
 * DevFlow Dashboard - Main Dashboard Page
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { getProjects } from "@/lib/database"

export default async function DashboardPage() {
  const projects = await getProjects()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your projects.</p>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardOverview initialProjects={projects} />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
