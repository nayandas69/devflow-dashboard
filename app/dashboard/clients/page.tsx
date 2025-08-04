/**
 * DevFlow Dashboard - Clients Page
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ClientsListWrapper } from "@/components/clients-list-wrapper"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { getClients } from "@/lib/database"

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">Manage your client relationships and contacts.</p>
          </div>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <ClientsListWrapper initialClients={clients} />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
