/**
 * DevFlow Dashboard - Create Project Modal Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { ProjectType, ProjectStatus, PaymentStatus, Project, Client } from "@/lib/types"

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  type: z.enum(["client", "personal", "open_source"]),
  status: z.enum(["pending", "in_progress", "completed", "delivered"]),
  payment_status: z.enum(["unpaid", "partial", "paid"]),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  clientIds: z.array(z.string()).optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (project: Project) => void
}

export function CreateProjectModal({ open, onOpenChange, onSuccess }: CreateProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      type: "personal",
      status: "pending",
      payment_status: "unpaid",
      clientIds: [],
    },
  })

  const projectType = watch("type")

  // Fetch clients when modal opens
  useEffect(() => {
    if (open) {
      fetchClients()
    }
  }, [open])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from("clients").select("*").order("name", { ascending: true })

      if (error) {
        console.error("Error fetching clients:", error)
        return
      }

      setClients(data || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("You must be logged in to create a project")
        return
      }

      const projectData = {
        title: data.title,
        description: data.description || null,
        type: data.type as ProjectType,
        status: data.status as ProjectStatus,
        payment_status: data.payment_status as PaymentStatus,
        budget: data.budget ? Number.parseFloat(data.budget) : null,
        deadline: data.deadline || null,
        user_id: user.id,
        progress: 0,
        paid_amount: 0,
      }

      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert([projectData])
        .select()
        .single()

      if (projectError) {
        console.error("Error creating project:", projectError)
        toast.error("Failed to create project")
        return
      }

      // If clients are selected, create project-client relationships
      if (selectedClients.length > 0 && data.type === "client") {
        const projectClientData = selectedClients.map((clientId) => ({
          project_id: newProject.id,
          client_id: clientId,
        }))

        const { error: relationError } = await supabase.from("project_clients").insert(projectClientData)

        if (relationError) {
          console.error("Error creating project-client relationships:", relationError)
          // Don't fail the whole operation, just log the error
        }
      }

      toast.success("Project created successfully!")
      reset()
      setSelectedClients([])
      onSuccess?.(newProject)
    } catch (error) {
      console.error("Error creating project:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClientToggle = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients((prev) => [...prev, clientId])
    } else {
      setSelectedClients((prev) => prev.filter((id) => id !== clientId))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Add a new project to your dashboard. Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input id="title" placeholder="Enter project title" {...register("title")} disabled={isLoading} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter project description"
              {...register("description")}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Type *</Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value as ProjectType)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="open_source">Open Source</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as ProjectStatus)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Selection - Only show for client projects */}
          {projectType === "client" && (
            <div className="space-y-2">
              <Label>Select Clients</Label>
              <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                {clients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No clients available. Create clients first.</p>
                ) : (
                  <div className="space-y-2">
                    {clients.map((client) => (
                      <div key={client.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={client.id}
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={(checked) => handleClientToggle(client.id, checked as boolean)}
                        />
                        <Label htmlFor={client.id} className="text-sm font-normal cursor-pointer">
                          {client.name} {client.company && `(${client.company})`}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {projectType === "client" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("budget")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  value={watch("payment_status")}
                  onValueChange={(value) => setValue("payment_status", value as PaymentStatus)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input id="deadline" type="date" {...register("deadline")} disabled={isLoading} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
