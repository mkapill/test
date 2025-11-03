import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

async function getSupabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await getSupabaseAdmin()

    const projectData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("projects").update(projectData).eq("id", id).select()

    if (error) {
      console.log("[v0] PUT projects error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.log("[v0] PUT projects exception:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseAdmin()

    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      console.log("[v0] DELETE projects error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.log("[v0] DELETE projects exception:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
