/**
 * DevFlow Dashboard - Project Search Filter Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, X, SortAsc, SortDesc } from "lucide-react"
import type { ProjectType, ProjectStatus, PaymentStatus } from "@/lib/types"

export interface ProjectFilters {
  search: string
  types: ProjectType[]
  statuses: ProjectStatus[]
  paymentStatuses: PaymentStatus[]
  sortBy: "smart" | "name" | "date" | "progress" | "deadline"
  sortDirection: "asc" | "desc"
}

interface ProjectsSearchFilterProps {
  filters: ProjectFilters
  onFiltersChange: (filters: ProjectFilters) => void
  totalCount: number
  filteredCount: number
}

const projectTypes: { value: ProjectType; label: string }[] = [
  { value: "client", label: "Client Projects" },
  { value: "personal", label: "Personal Projects" },
  { value: "open_source", label: "Open Source" },
]

const projectStatuses: { value: ProjectStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "delivered", label: "Delivered" },
]

const paymentStatuses: { value: PaymentStatus; label: string }[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial Payment" },
  { value: "paid", label: "Fully Paid" },
]

const sortOptions = [
  { value: "smart" as const, label: "Smart Sort" },
  { value: "name" as const, label: "Name" },
  { value: "date" as const, label: "Date Created" },
  { value: "progress" as const, label: "Progress" },
  { value: "deadline" as const, label: "Deadline" },
]

export function ProjectsSearchFilter({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: ProjectsSearchFilterProps) {
  const [searchValue, setSearchValue] = useState(filters.search)

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    onFiltersChange({ ...filters, search: value })
  }

  const toggleType = (type: ProjectType) => {
    const newTypes = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type]
    onFiltersChange({ ...filters, types: newTypes })
  }

  const toggleStatus = (status: ProjectStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status]
    onFiltersChange({ ...filters, statuses: newStatuses })
  }

  const togglePaymentStatus = (paymentStatus: PaymentStatus) => {
    const newPaymentStatuses = filters.paymentStatuses.includes(paymentStatus)
      ? filters.paymentStatuses.filter((ps) => ps !== paymentStatus)
      : [...filters.paymentStatuses, paymentStatus]
    onFiltersChange({ ...filters, paymentStatuses: newPaymentStatuses })
  }

  const clearFilters = () => {
    setSearchValue("")
    onFiltersChange({
      search: "",
      types: [],
      statuses: [],
      paymentStatuses: [],
      sortBy: "smart",
      sortDirection: "desc",
    })
  }

  const toggleSortDirection = () => {
    onFiltersChange({
      ...filters,
      sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
    })
  }

  const activeFiltersCount = filters.types.length + filters.statuses.length + filters.paymentStatuses.length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects by name or description..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => handleSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 flex-wrap">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Project Types</DropdownMenuLabel>
              {projectTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type.value}
                  checked={filters.types.includes(type.value)}
                  onCheckedChange={() => toggleType(type.value)}
                >
                  {type.label}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {projectStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status.value}
                  checked={filters.statuses.includes(status.value)}
                  onCheckedChange={() => toggleStatus(status.value)}
                >
                  {status.label}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
              {paymentStatuses.map((paymentStatus) => (
                <DropdownMenuCheckboxItem
                  key={paymentStatus.value}
                  checked={filters.paymentStatuses.includes(paymentStatus.value)}
                  onCheckedChange={() => togglePaymentStatus(paymentStatus.value)}
                >
                  {paymentStatus.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {filters.sortDirection === "asc" ? (
                  <SortAsc className="h-4 w-4 mr-2" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-2" />
                )}
                Sort by {sortOptions.find((opt) => opt.value === filters.sortBy)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onFiltersChange({ ...filters, sortBy: option.value })}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleSortDirection}>
                {filters.sortDirection === "asc" ? "Sort Descending" : "Sort Ascending"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {(activeFiltersCount > 0 || filters.search) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {filteredCount === totalCount ? (
            <span>{totalCount} projects</span>
          ) : (
            <span>
              {filteredCount} of {totalCount} projects
            </span>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {(filters.types.length > 0 || filters.statuses.length > 0 || filters.paymentStatuses.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {filters.types.map((type) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {projectTypes.find((t) => t.value === type)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 ml-1 hover:bg-transparent"
                onClick={() => toggleType(type)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          {filters.statuses.map((status) => (
            <Badge key={status} variant="secondary" className="text-xs">
              {projectStatuses.find((s) => s.value === status)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 ml-1 hover:bg-transparent"
                onClick={() => toggleStatus(status)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          {filters.paymentStatuses.map((paymentStatus) => (
            <Badge key={paymentStatus} variant="secondary" className="text-xs">
              {paymentStatuses.find((ps) => ps.value === paymentStatus)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 ml-1 hover:bg-transparent"
                onClick={() => togglePaymentStatus(paymentStatus)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
