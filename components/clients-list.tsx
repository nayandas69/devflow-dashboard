/**
 * DevFlow Dashboard - Clients List Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import { useState } from "react"
import { EmptyState } from "@/components/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Users, Mail, Phone, Building, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Client } from "@/lib/types"

interface ClientsListProps {
  clients: Client[]
  onClientUpdate: (clients: Client[]) => void
}

export function ClientsList({ clients, onClientUpdate }: ClientsListProps) {
  const [deleteClient, setDeleteClient] = useState<Client | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDeleteClient = async () => {
    if (!deleteClient) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("clients").delete().eq("id", deleteClient.id)

      if (error) {
        console.error("Error deleting client:", error)
        toast.error("Failed to delete client")
        return
      }

      // Update the clients list
      const updatedClients = clients.filter((c) => c.id !== deleteClient.id)
      onClientUpdate(updatedClients)
      toast.success("Client deleted successfully")
      setDeleteClient(null)
    } catch (error) {
      console.error("Error deleting client:", error)
      toast.error("Failed to delete client")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewClient = (client: Client) => {
    // For now, just show client details in a toast
    toast.info(`Client: ${client.name}${client.company ? ` (${client.company})` : ""}`)
  }

  const handleEditClient = (client: Client) => {
    // TODO: Implement edit client modal
    toast.info("Edit client functionality coming soon")
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No clients yet"
        description="Add your first client to start managing your business relationships."
      />
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{client.name}</CardTitle>
                  {client.company && (
                    <Badge variant="secondary" className="mt-1">
                      {client.company}
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewClient(client)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditClient(client)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Client
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteClient(client)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.email && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.company && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{client.company}</span>
                </div>
              )}
              {client.notes && <p className="text-sm text-muted-foreground line-clamp-2">{client.notes}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteClient?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
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
