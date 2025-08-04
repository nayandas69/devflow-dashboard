/**
 * DevFlow Dashboard - Edit Project Modal Component
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
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Minus } from "lucide-react"
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
  paid_amount: z.string().optional(),
  deadline: z.string().optional(),
  progress: z.number().min(0).max(100),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface EditProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onSuccess?: (project: Project) => void
}

export function EditProjectModal({ open, onOpenChange, project, onSuccess }: EditProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
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
  })

  const projectType = watch("type")
  const budget = watch("budget")
  const paidAmount = watch("paid_amount")

  // Initialize form when project changes
  useEffect(() => {
    if (project && open) {
      reset({
        title: project.title,
        description: project.description || "",
        type: project.type,
        status: project.status,
        payment_status: project.payment_status,
        budget: project.budget?.toString() || "",
        paid_amount: project.paid_amount?.toString() || "",
        deadline: project.deadline || "",
        progress: project.progress || 0,
      })
      setProgress(project.progress || 0)
      fetchClients()
    }
  }, [project, open, reset])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from("clients").select("*").order("name", { ascending: true })

      if (error) {
        console.error("Error fetching clients:", error)
        return
      }

      setClients(data || [])

      // Fetch project clients if it's a client project
      if (project && project.type === "client") {
        const { data: projectClients, error: pcError } = await supabase
          .from("project_clients")
          .select("client_id")
          .eq("project_id", project.id)

        if (!pcError && projectClients) {
          setSelectedClients(projectClients.map((pc) => pc.client_id))
        }
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const onSubmit = async (data: ProjectFormData) => {
    if (!project) return

    setIsLoading(true)

    try {
      const projectData = {
        title: data.title,
        description: data.description || null,
        type: data.type as ProjectType,
        status: data.status as ProjectStatus,
        payment_status: data.payment_status as PaymentStatus,
        budget: data.budget ? Number.parseFloat(data.budget) : null,
        paid_amount: data.paid_amount ? Number.parseFloat(data.paid_amount) : 0,
        deadline: data.deadline || null,
        progress: progress,
      }

      const { data: updatedProject, error: projectError } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", project.id)
        .select()
        .single()

      if (projectError) {
        console.error("Error updating project:", projectError)
        toast.error("Failed to update project")
        return
      }

      // Update project-client relationships if it's a client project
      if (data.type === "client") {
        // Delete existing relationships
        await supabase.from("project_clients").delete().eq("project_id", project.id)

        // Create new relationships
        if (selectedClients.length > 0) {
          const projectClientData = selectedClients.map((clientId) => ({
            project_id: project.id,
            client_id: clientId,
          }))

          const { error: relationError } = await supabase.from("project_clients").insert(projectClientData)

          if (relationError) {
            console.error("Error updating project-client relationships:", relationError)
          }
        }
      }

      toast.success("Project updated successfully!")
      onSuccess?.(updatedProject)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating project:", error)
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

  const adjustProgress = (increment: number) => {
    const newProgress = Math.max(0, Math.min(100, progress + increment))
    setProgress(newProgress)
    setValue("progress", newProgress)
  }

  const calculatePaymentPercentage = () => {
    const budgetNum = budget ? Number.parseFloat(budget) : 0
    const paidNum = paidAmount ? Number.parseFloat(paidAmount) : 0
    if (budgetNum === 0) return 0
    return Math.round((paidNum / budgetNum) * 100)
  }

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update your project details and track progress.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TabsContent value="details" className="space-y-4">
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

              {projectType === "client" && (
                <div className="space-y-2">
                  <Label>Select Clients</Label>
                  <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                    {clients.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No clients available.</p>
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

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" {...register("deadline")} disabled={isLoading} />
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Progress: {progress}%</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => adjustProgress(-5)}
                          disabled={progress <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => adjustProgress(5)}
                          disabled={progress >= 100}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[progress]}
                      onValueChange={(value) => {
                        setProgress(value[0])
                        setValue("progress", value[0])
                      }}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setProgress(value)
                          setValue("progress", value)
                        }}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              {projectType === "client" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget">Total Budget ($)</Label>
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
                        <Label htmlFor="paid_amount">Amount Paid ($)</Label>
                        <Input
                          id="paid_amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...register("paid_amount")}
                          disabled={isLoading}
                        />
                      </div>
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
                          <SelectItem value="partial">Partial Payment</SelectItem>
                          <SelectItem value="paid">Fully Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {budget && paidAmount && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Payment Progress</span>
                          <span className="text-sm">{calculatePaymentPercentage()}%</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(calculatePaymentPercentage(), 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>${paidAmount}</span>
                          <span>${budget}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("payment_status", "unpaid")
                          setValue("paid_amount", "0")
                        }}
                      >
                        No Payment
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("payment_status", "partial")
                          if (budget) {
                            setValue("paid_amount", (Number.parseFloat(budget) * 0.5).toString())
                          }
                        }}
                      >
                        50% Advance
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("payment_status", "paid")
                          setValue("paid_amount", budget || "0")
                        }}
                      >
                        Full Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Project
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
