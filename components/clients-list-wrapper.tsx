/**
 * DevFlow Dashboard - Clients List Warpper Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import { useState, useMemo } from "react"
import { ClientsList } from "@/components/clients-list"
import { CreateClientModal } from "@/components/create-client-modal"
import { ClientsSearchFilter, type ClientFilters } from "@/components/clients-search-filter"
import { Pagination, PaginationInfo } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Client } from "@/lib/types"

interface ClientsListWrapperProps {
  initialClients: Client[]
}

const ITEMS_PER_PAGE = 12

export function ClientsListWrapper({ initialClients }: ClientsListWrapperProps) {
  const [clients, setClients] = useState(initialClients)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ClientFilters>({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
    hasEmail: null,
    hasPhone: null,
    hasCompany: null,
  })

  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          (client.email && client.email.toLowerCase().includes(searchLower)) ||
          (client.phone && client.phone.toLowerCase().includes(searchLower)) ||
          (client.company && client.company.toLowerCase().includes(searchLower)) ||
          (client.notes && client.notes.toLowerCase().includes(searchLower)),
      )
    }

    // Apply information filters
    if (filters.hasEmail !== null) {
      filtered = filtered.filter((client) => (client.email ? true : false) === filters.hasEmail)
    }

    if (filters.hasPhone !== null) {
      filtered = filtered.filter((client) => (client.phone ? true : false) === filters.hasPhone)
    }

    if (filters.hasCompany !== null) {
      filtered = filtered.filter((client) => (client.company ? true : false) === filters.hasCompany)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "company":
          const aCompany = a.company || ""
          const bCompany = b.company || ""
          comparison = aCompany.localeCompare(bCompany)
          break
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }

      return filters.sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [clients, filters])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedClients.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedClients = filteredAndSortedClients.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: ClientFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleCreateClient = () => {
    setShowCreateModal(true)
  }

  const handleClientCreated = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev])
    setShowCreateModal(false)
    setCurrentPage(1) // Go to first page to see new client
  }

  const handleClientUpdate = (updatedClients: Client[]) => {
    setClients(updatedClients)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <Button onClick={handleCreateClient}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="space-y-6">
        <ClientsSearchFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalCount={clients.length}
          filteredCount={filteredAndSortedClients.length}
        />

        <ClientsList clients={paginatedClients} onClientUpdate={handleClientUpdate} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <PaginationInfo
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedClients.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <CreateClientModal open={showCreateModal} onOpenChange={setShowCreateModal} onSuccess={handleClientCreated} />
    </>
  )
}
