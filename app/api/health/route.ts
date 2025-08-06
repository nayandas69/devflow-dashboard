/**
 * DevFlow Dashboard - Health Check API Endpoint
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const startTime = Date.now()

  try {
    const supabase = await createClient()

    // Simple database ping - just check if we can connect
    const { data, error } = await supabase.from("profiles").select("count").limit(1).single()

    const responseTime = Date.now() - startTime

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine for our health check
      throw error
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      responseTime: `${responseTime}ms`,
      message: "Database connection successful",
    })
  } catch (error) {
    const responseTime = Date.now() - startTime

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Database connection failed",
      },
      { status: 500 },
    )
  }
}

// Also support POST for GitHub Actions
export async function POST() {
  return GET()
}
