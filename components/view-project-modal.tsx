/**
 * DevFlow Dashboard - View Project Modal Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, User, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Project, Client } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ViewProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
}

const projectTypeColors = {
  client: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  personal: "bg-green-500/10 text-green-700 dark:text-green-300",
  open_source: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  completed: "bg-green-500/10 text-green-700 dark:text-green-300",
  delivered: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
}

const paymentStatusColors = {
  unpaid: "bg-red-500/10 text-red-700 dark:text-red-300",
  partial: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  paid: "bg-green-500/10 text-green-700 dark:text-green-300",
}

const statusIcons = {
  pending: Clock,
  in_progress: Circle,
  completed: CheckCircle2,
  delivered: CheckCircle2,
}

export function ViewProjectModal({ open, onOpenChange, project }: ViewProjectModalProps) {
  const [projectClients, setProjectClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (project && open && project.type === "client") {
      fetchProjectClients()
    }
  }, [project, open])

  const fetchProjectClients = async () => {
    if (!project) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("project_clients")
        .select(`
          client:clients(*)
        `)
        .eq("project_id", project.id)

      if (error) {
        console.error("Error fetching project clients:", error)
        return
      }

      const clients = data?.map((pc: any) => pc.client).filter(Boolean) || []
      setProjectClients(clients)
    } catch (error) {
      console.error("Error fetching project clients:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!project) return null

  const StatusIcon = statusIcons[project.status]

  // Calculate days until deadline
  const daysUntilDeadline = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const paymentPercentage =
    project.budget && project.paid_amount ? Math.round((project.paid_amount / project.budget) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{project.title}</span>
            <Badge variant="secondary" className={cn("text-xs", projectTypeColors[project.type])}>
              {project.type.replace("_", " ")}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            {project.type === "client" && <TabsTrigger value="payment">Payment</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Status and Progress */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs flex items-center gap-1 w-fit", statusColors[project.status])}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {project.status.replace("_", " ")}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {project.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Clients (for client projects) */}
            {project.type === "client" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading clients...</p>
                  ) : projectClients.length > 0 ? (
                    <div className="space-y-2">
                      {projectClients.map((client) => (
                        <div key={client.id} className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{client.name}</span>
                          {client.company && (
                            <Badge variant="outline" className="text-xs">
                              {client.company}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No clients assigned</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{new Date(project.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{new Date(project.updated_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </div>

            {/* Deadline */}
            {project.deadline && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Deadline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(project.deadline).toLocaleDateString()}</span>
                    {daysUntilDeadline !== null && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          daysUntilDeadline < 7 && daysUntilDeadline >= 0
                            ? "border-yellow-500 text-yellow-700"
                            : daysUntilDeadline < 0
                              ? "border-red-500 text-red-700"
                              : "",
                        )}
                      >
                        {daysUntilDeadline >= 0
                          ? `${daysUntilDeadline} days left`
                          : `${Math.abs(daysUntilDeadline)} days overdue`}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deadline warning */}
            {daysUntilDeadline !== null && daysUntilDeadline < 7 && daysUntilDeadline >= 0 && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">Deadline approaching</span>
              </div>
            )}
          </TabsContent>

          {project.type === "client" && (
            <TabsContent value="payment" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className={cn("text-xs", paymentStatusColors[project.payment_status])}>
                      {project.payment_status === "partial" ? "Partial Payment" : project.payment_status}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">${project.budget?.toLocaleString() || "0"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {project.budget && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Payment Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Amount Paid</span>
                      <span className="text-sm font-medium">${project.paid_amount?.toLocaleString() || "0"}</span>
                    </div>
                    <Progress value={paymentPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${project.paid_amount?.toLocaleString() || "0"}</span>
                      <span>{paymentPercentage}%</span>
                      <span>${project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm">Remaining</span>
                      <span className="text-sm font-medium">
                        ${((project.budget || 0) - (project.paid_amount || 0)).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
