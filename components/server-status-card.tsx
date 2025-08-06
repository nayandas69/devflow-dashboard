/**
 * DevFlow Dashboard - Server Status Card Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Database, Clock, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"

interface HealthStatus {
  status: "healthy" | "unhealthy"
  timestamp: string
  database: "connected" | "disconnected"
  responseTime: string
  message: string
  error?: string
}

export function ServerStatusCard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  const checkHealth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setHealthStatus(data)
      setLastChecked(new Date().toLocaleString())
    } catch (error) {
      setHealthStatus({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        responseTime: "N/A",
        message: "Failed to reach health endpoint",
        error: error instanceof Error ? error.message : "Network error",
      })
      setLastChecked(new Date().toLocaleString())
    } finally {
      setIsLoading(false)
    }
  }

  // Check health on component mount
  useEffect(() => {
    checkHealth()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20"
      case "unhealthy":
        return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20"
    }
  }

  const getDbStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-600 dark:text-green-400"
      case "disconnected":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Server Status
          </CardTitle>
          <Button variant="outline" size="sm" onClick={checkHealth} disabled={isLoading} className="h-8 bg-transparent">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Checking..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {healthStatus ? (
          <>
            {/* Overall Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Status</span>
              <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(healthStatus.status)}`}>
                {healthStatus.status === "healthy" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {healthStatus.status}
              </Badge>
            </div>

            {/* Database Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </span>
              <span className={`text-sm font-medium ${getDbStatusColor(healthStatus.database)}`}>
                {healthStatus.database}
              </span>
            </div>

            {/* Response Time */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Response Time
              </span>
              <span className="text-sm font-medium">{healthStatus.responseTime}</span>
            </div>

            {/* Message */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{healthStatus.message}</p>
              {healthStatus.error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">Error: {healthStatus.error}</p>
              )}
            </div>

            {/* Last Checked */}
            {lastChecked && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">Last checked: {lastChecked}</div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Checking server status...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
