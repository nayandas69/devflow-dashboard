/**
 * DevFlow Dashboard - Dynamic Progress Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const DynamicProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Determine color based on progress value
  const getProgressColor = (progress = 0) => {
    if (progress <= 10) return "bg-red-500 dark:bg-red-500"
    if (progress <= 25) return "bg-orange-500 dark:bg-orange-500"
    if (progress <= 50) return "bg-yellow-500 dark:bg-yellow-500"
    if (progress <= 75) return "bg-blue-500 dark:bg-blue-500"
    if (progress < 100) return "bg-green-500 dark:bg-green-500"
    return "bg-green-600 dark:bg-green-400" // 100% completion
  }

  const getProgressGlow = (progress = 0) => {
    if (progress <= 10) return "shadow-red-500/50"
    if (progress <= 25) return "shadow-orange-500/50"
    if (progress <= 50) return "shadow-yellow-500/50"
    if (progress <= 75) return "shadow-blue-500/50"
    if (progress < 100) return "shadow-green-500/50"
    return "shadow-green-600/50" // 100% completion
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out",
          getProgressColor(value),
          value === 100 && `shadow-lg ${getProgressGlow(value)}`,
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
DynamicProgress.displayName = ProgressPrimitive.Root.displayName

export { DynamicProgress }
