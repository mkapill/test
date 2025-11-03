-- Create projects table to store all project data
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  link TEXT NOT NULL,
  tech TEXT,
  project TEXT,
  price TEXT,
  features TEXT[],
  buy_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read projects
CREATE POLICY "Allow public read access" 
  ON projects FOR SELECT 
  USING (true);

-- Allow all write operations (service role will bypass RLS anyway, but this ensures authenticated users work too)
CREATE POLICY "Allow write access for admin" 
  ON projects FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow update for admin" 
  ON projects FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete for admin" 
  ON projects FOR DELETE 
  USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_tech ON projects(tech);
CREATE INDEX IF NOT EXISTS idx_projects_project ON projects(project);
