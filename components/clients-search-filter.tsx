/**
 * DevFlow Dashboard - Clients Search and Filter Component
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
} from "@/components/ui/dropdown-menu"
import { Search, Filter, X, SortAsc, SortDesc } from "lucide-react"

export interface ClientFilters {
  search: string
  sortBy: "name" | "company" | "date"
  sortOrder: "asc" | "desc"
  hasEmail: boolean | null
  hasPhone: boolean | null
  hasCompany: boolean | null
}

interface ClientsSearchFilterProps {
  filters: ClientFilters
  onFiltersChange: (filters: ClientFilters) => void
  totalCount: number
  filteredCount: number
}

const sortOptions = [
  { value: "name" as const, label: "Name (A-Z)" },
  { value: "company" as const, label: "Company" },
  { value: "date" as const, label: "Date Added" },
]

export function ClientsSearchFilter({ filters, onFiltersChange, totalCount, filteredCount }: ClientsSearchFilterProps) {
  const [searchValue, setSearchValue] = useState(filters.search)

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    onFiltersChange({ ...filters, search: value })
  }

  const clearFilters = () => {
    setSearchValue("")
    onFiltersChange({
      search: "",
      sortBy: "name",
      sortOrder: "asc",
      hasEmail: null,
      hasPhone: null,
      hasCompany: null,
    })
  }

  const toggleSortOrder = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
    })
  }

  const activeFiltersCount = [filters.hasEmail, filters.hasPhone, filters.hasCompany].filter(
    (filter) => filter !== null,
  ).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients by name, email, phone, or company..."
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
              <DropdownMenuLabel>Filter by Information</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    hasEmail: filters.hasEmail === true ? null : true,
                  })
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>Has Email</span>
                  {filters.hasEmail === true && <Badge variant="secondary">✓</Badge>}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    hasPhone: filters.hasPhone === true ? null : true,
                  })
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>Has Phone</span>
                  {filters.hasPhone === true && <Badge variant="secondary">✓</Badge>}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    hasCompany: filters.hasCompany === true ? null : true,
                  })
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>Has Company</span>
                  {filters.hasCompany === true && <Badge variant="secondary">✓</Badge>}
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    sortBy: "name",
                    sortOrder: "asc",
                    search: "",
                  })
                }
              >
                All Clients (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    sortBy: "date",
                    sortOrder: "desc",
                    search: "",
                  })
                }
              >
                Recently Added
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    hasCompany: true,
                    sortBy: "company",
                    sortOrder: "asc",
                  })
                }
              >
                Business Clients
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {filters.sortOrder === "asc" ? (
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
              <DropdownMenuItem onClick={toggleSortOrder}>
                {filters.sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
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
            <span>{totalCount} clients</span>
          ) : (
            <span>
              {filteredCount} of {totalCount} clients
            </span>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.hasEmail === true && (
            <Badge variant="secondary" className="text-xs">
              Has Email
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 ml-1 hover:bg-transparent"
                onClick={() => onFiltersChange({ ...filters, hasEmail: null })}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.hasPhone === true && (
            <Badge variant="secondary" className="text-xs">
              Has Phone
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 ml-1 hover:bg-transparent"
                onClick={() => onFiltersChange({ ...filters, hasPhone: null })}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.hasCompany === true && (
            <Badge variant="secondary" className="text-xs">
              Has Company
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 ml-1 hover:bg-transparent"
                onClick={() => onFiltersChange({ ...filters, hasCompany: null })}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
