"use client"

import CourseCard from "./course-card"
import { useMemo } from "react"
import { useProjects } from "@/lib/use-projects"

interface CourseGridProps {
  selectedTech: string | null
  selectedProject: string | null
}

export default function CourseGrid({ selectedTech, selectedProject }: CourseGridProps) {
  const { projects, loading } = useProjects()

  const filteredCourses = useMemo(() => {
    return projects.filter((course) => {
      const matchesTech = !selectedTech || course.tech === selectedTech
      const matchesProject = !selectedProject || course.project === selectedProject
      return matchesTech && matchesProject
    })
  }, [selectedTech, selectedProject, projects])

  const getDisplayTitle = () => {
    if (selectedTech && selectedProject) {
      return "Projects"
    } else if (selectedTech) {
      return `${selectedTech.toUpperCase()} Courses`
    } else if (selectedProject) {
      const projectName =
        {
          fullstack: "Full Stack Web Dev",
          software: "Software",
          datascience: "Data Science",
          aiml: "AI/ML",
          cloud: "Cloud",
          devops: "DevOps",
          uiux: "UI/UX",
          cybersecurity: "Cybersecurity",
          graphic: "Graphic Design",
          blockchain: "Blockchain",
        }[selectedProject] || "Project"
      return `${projectName} Courses`
    }
    return "All Projects"
  }

  if (loading) {
    return (
      <section className="px-6 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-2xl md:text-3xl font-bold text-foreground">{getDisplayTitle()}</h2>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-6 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-2xl md:text-3xl font-bold text-foreground">{getDisplayTitle()}</h2>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses found matching your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
