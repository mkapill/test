"use client"

import { useState, useEffect, useCallback } from "react"

interface Project {
  id: string
  title: string
  description: string
  image: string
  link: string
  tech: string
  project: string
  price: string
  features: string[]
  buy_link: string
  created_at: string
  updated_at: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects from API with caching
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/projects", {
        headers: { "Cache-Control": "max-age=60" },
      })
      if (!response.ok) throw new Error("Failed to fetch projects")
      const data = await response.json()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()

    // Real-time updates will still work when admin makes changes via API
  }, [fetchProjects])

  return { projects, loading, error, refetch: fetchProjects }
}
