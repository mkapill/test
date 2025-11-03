"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Plus, Trash2, Edit2, X, Upload, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useProjects } from "@/lib/use-projects"

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
}

export default function AdminDashboard() {
  const { projects, loading: projectsLoading, refetch } = useProjects()
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
    tech: "",
    project: "",
    price: "",
    features: "",
    buy_link: "",
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setFormData({ ...formData, image: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddProject = useCallback(async () => {
    if (!formData.title || !formData.link) {
      setError("Please fill in at least title and link")
      return
    }

    if (!formData.image) {
      setError("Please upload an image")
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const featuresArray = formData.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f)

      const projectData = {
        ...formData,
        features: featuresArray,
        buy_link: formData.buy_link,
      }

      if (editingId) {
        // Update existing project
        const response = await fetch(`/api/projects/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        })

        if (!response.ok) throw new Error("Failed to update project")
        setSuccessMessage("Project updated successfully!")
        setEditingId(null)
      } else {
        // Create new project
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...projectData,
            id: Date.now().toString(),
          }),
        })

        if (!response.ok) throw new Error("Failed to create project")
        setSuccessMessage("Project added successfully!")
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        image: "",
        link: "",
        tech: "",
        project: "",
        price: "",
        features: "",
        buy_link: "",
      })
      setImagePreview("")
      setIsAddingProject(false)

      // Refetch projects to get real-time updates
      await refetch()

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSaving(false)
    }
  }, [formData, editingId, refetch])

  const handleDeleteProject = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this project?")) return

      try {
        setError(null)
        const response = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to delete project")
        setSuccessMessage("Project deleted successfully!")

        await refetch()

        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
    },
    [refetch],
  )

  const handleEditProject = (project: Project) => {
    const featuresString = Array.isArray(project.features)
      ? project.features.join(", ")
      : (project.features as unknown as string) || ""

    setFormData({
      ...project,
      features: featuresString,
      buy_link: project.buy_link,
    })
    setImagePreview(project.image)
    setEditingId(project.id)
    setIsAddingProject(true)
  }

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      link: "",
      tech: "",
      project: "",
      price: "",
      features: "",
      buy_link: "",
    })
    setImagePreview("")
    setEditingId(null)
    setIsAddingProject(false)
    setError(null)
  }

  return (
    <main className="px-6 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {showSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-500/20 border border-green-500/30 px-4 py-3 animate-in slide-in-from-top">
            <Check className="h-5 w-5 text-green-500" />
            <p className="text-sm font-medium text-green-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 animate-in slide-in-from-top">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Project Management</h1>
            <p className="text-sm text-muted-foreground mt-2">All changes sync across all devices in real-time</p>
          </div>
          {!isAddingProject && (
            <Button
              onClick={() => setIsAddingProject(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Project
            </Button>
          )}
        </div>

        {isAddingProject && (
          <Card className="p-6 mb-8 border border-border bg-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Project" : "Add New Project"}</h2>
              <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Title *</label>
                <Input
                  placeholder="Project title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <Input
                  placeholder="Project description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Project Link / Href *</label>
                <Input
                  placeholder="/course/example or https://example.com"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Upload Image *</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isSaving}
                  />
                  <div className="flex items-center justify-center w-full px-3 py-2 rounded-md border border-input bg-background text-foreground cursor-pointer hover:bg-muted/50 transition">
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="text-sm">Choose image</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Tech Tag</label>
                <select
                  value={formData.tech}
                  onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                  disabled={isSaving}
                >
                  <option value="">Select tech</option>
                  <option value="js">JavaScript</option>
                  <option value="react">React</option>
                  <option value="gsap">GSAP</option>
                  <option value="database">Database</option>
                  <option value="video">Video</option>
                  <option value="kubernetes">Kubernetes</option>
                  <option value="cloud">Cloud</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Project Category</label>
                <select
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                  disabled={isSaving}
                >
                  <option value="">Select category</option>
                  <option value="fullstack">Full Stack</option>
                  <option value="uiux">UI/UX</option>
                  <option value="software">Software</option>
                  <option value="aiml">AI/ML</option>
                  <option value="devops">DevOps</option>
                  <option value="datascience">Data Science</option>
                  <option value="blockchain">Blockchain</option>
                  <option value="cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Price (e.g., ₹99/-)</label>
                <Input
                  placeholder="₹99/-"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Features (comma-separated)</label>
                <Input
                  placeholder="Life Time Access, Installation Video, Instant Email Delivery"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full"
                  disabled={isSaving}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Buy Link / Razorpay URL</label>
                <Input
                  placeholder="https://razorpay.com/... or your payment link"
                  value={formData.buy_link}
                  onChange={(e) => setFormData({ ...formData, buy_link: e.target.value })}
                  className="w-full"
                  disabled={isSaving}
                />
              </div>
            </div>

            {imagePreview && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-3">Image Preview:</p>
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-40 rounded-lg object-cover" />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleAddProject}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSaving ? "Saving..." : editingId ? "Update Project" : "Add Project"}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {projectsLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Description</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Tech</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Category</th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project: Project) => (
                  <tr key={project.id} className="border-b border-border hover:bg-muted/30 transition">
                    <td className="px-4 py-3 text-foreground font-medium">{project.title}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {project.description?.substring(0, 30)}...
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm font-semibold">{project.price || "-"}</td>
                    <td className="px-4 py-3 text-foreground text-sm">{project.tech}</td>
                    <td className="px-4 py-3 text-foreground text-sm">{project.project}</td>
                    <td className="px-4 py-3 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="p-2 hover:bg-muted rounded-md transition text-foreground"
                        title="Edit project"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 hover:bg-destructive/20 rounded-md transition text-destructive"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!projectsLoading && projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No projects added yet.</p>
            <Button onClick={() => setIsAddingProject(true)} className="bg-primary hover:bg-primary/90">
              Add Your First Project
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
