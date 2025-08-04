/**
 * DevFlow Dashboard - Project Card Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DynamicProgress } from "@/components/ui/dynamic-progress"
import { Button } from "@/components/ui/button"
import {
  MoreHorizontal,
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Trophy,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Project } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
  onView?: (project: Project) => void
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
  delivered: Trophy,
}

export function ProjectCard({ project, onEdit, onDelete, onView }: ProjectCardProps) {
  const StatusIcon = statusIcons[project.status]
  const isCompleted = project.status === "completed" || project.status === "delivered"

  // Calculate days until deadline
  const daysUntilDeadline = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Don't show deadline warning for completed/delivered projects
  const showDeadlineWarning =
    !isCompleted && daysUntilDeadline !== null && daysUntilDeadline < 7 && daysUntilDeadline >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "card-hover cursor-pointer transition-all duration-200",
          isCompleted && "opacity-90 hover:opacity-100",
        )}
        onClick={() => onView?.(project)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className={cn("text-lg font-semibold line-clamp-1", isCompleted && "text-muted-foreground")}>
                {project.title}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={cn("text-xs", projectTypeColors[project.type])}>
                  {project.type.replace("_", " ")}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn("text-xs flex items-center gap-1", statusColors[project.status])}
                >
                  <StatusIcon className="h-3 w-3" />
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onView?.(project)
                  }}
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(project)
                  }}
                >
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(project)
                  }}
                >
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          {project.description && (
            <p
              className={cn("text-sm line-clamp-2", isCompleted ? "text-muted-foreground/70" : "text-muted-foreground")}
            >
              {project.description}
            </p>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className={cn("font-medium", project.progress === 100 && "text-green-600 dark:text-green-400")}>
                {project.progress}%
              </span>
            </div>
            <DynamicProgress value={project.progress} className="h-2" />
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Payment Status */}
            {project.type === "client" && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary" className={cn("text-xs", paymentStatusColors[project.payment_status])}>
                  {project.payment_status}
                </Badge>
              </div>
            )}

            {/* Deadline */}
            {project.deadline && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span
                  className={cn(
                    "text-xs",
                    !isCompleted && daysUntilDeadline !== null && daysUntilDeadline < 7
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground",
                    isCompleted && "text-muted-foreground/70",
                  )}
                >
                  {isCompleted
                    ? `Completed ${new Date(project.deadline).toLocaleDateString()}`
                    : daysUntilDeadline !== null && daysUntilDeadline >= 0
                      ? `${daysUntilDeadline} days left`
                      : daysUntilDeadline !== null && daysUntilDeadline < 0
                        ? `${Math.abs(daysUntilDeadline)} days overdue`
                        : new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Client count for client projects */}
            {project.type === "client" && project.clients && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {project.clients.length} client{project.clients.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Budget for client projects */}
            {project.type === "client" && project.budget && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  ${project.paid_amount.toLocaleString()} / ${project.budget.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Deadline warning - only for active projects */}
          {showDeadlineWarning && (
            <div className="flex items-center space-x-2 p-2 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-yellow-700 dark:text-yellow-300">Deadline approaching</span>
            </div>
          )}

          {/* Completion celebration for 100% projects */}
          {project.progress === 100 && (
            <div className="flex items-center space-x-2 p-2 bg-green-500/10 rounded-lg">
              <Trophy className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700 dark:text-green-300">
                {project.status === "delivered" ? "Project delivered!" : "Project completed!"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
