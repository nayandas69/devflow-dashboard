/**
 * DevFlow Dashboard - Settings-form Component
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, X, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

export function SettingsForm() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  })

  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view settings.",
          variant: "destructive",
        })
        return
      }

      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        })
        return
      }

      setProfile(profile)
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      // Create unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      console.log("Uploading file:", fileName)

      // Remove old avatar if exists
      if (profile?.avatar_url) {
        const oldFileName = profile.avatar_url.split("/").pop()
        if (oldFileName) {
          console.log("Removing old file:", oldFileName)
          await supabase.storage.from("avatars").remove([oldFileName])
        }
      }

      // Upload new file
      const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw uploadError
      }

      console.log("Upload successful:", uploadData)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      console.log("Public URL:", publicUrl)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)

      if (updateError) {
        console.error("Profile update error:", updateError)
        throw updateError
      }

      // Update local state
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null))

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: `Failed to upload image: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const handleRemoveImage = async () => {
    if (!profile?.avatar_url) return

    setUploading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      // Remove file from storage
      const fileName = profile.avatar_url.split("/").pop()
      if (fileName) {
        const { error: deleteError } = await supabase.storage.from("avatars").remove([fileName])

        if (deleteError) {
          console.error("Delete error:", deleteError)
        }
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setProfile((prev) => (prev ? { ...prev, avatar_url: null } : null))

      toast({
        title: "Success",
        description: "Profile picture removed successfully!",
      })
    } catch (error: any) {
      console.error("Remove error:", error)
      toast({
        title: "Remove failed",
        description: `Failed to remove image: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          email: formData.email,
        })
        .eq("id", user.id)

      if (error) throw error

      // Update local state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: formData.full_name,
              email: formData.email,
            }
          : null,
      )

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error: any) {
      console.error("Update error:", error)
      toast({
        title: "Update failed",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load profile data.</p>
      </div>
    )
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload a profile picture. JPG, PNG or WebP. Max size 5MB.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-lg">{getInitials(profile.full_name, profile.email)}</AvatarFallback>
              </Avatar>
              {profile.avatar_url && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="cursor-pointer bg-transparent"
                  asChild
                >
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Upload Photo
                      </>
                    )}
                  </span>
                </Button>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile information and email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
