-- =====================================================
-- DevFlow Dashboard - Complete Database Schema
-- =====================================================
-- Author: Nayan Das <nayanchandradas@hotmail.com>
-- Repository: https://github.com/nayandas69/devflow-dashboard
-- License: MIT
-- Version: 1.0.0
-- Last Updated: 2025-08-04
-- =====================================================

-- =====================================================
-- EXTENSIONS & SETUP
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CUSTOM TYPES (ENUMS)
-- =====================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS project_type CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Project type enumeration
CREATE TYPE project_type AS ENUM ('client', 'personal', 'open_source');

-- Project status enumeration  
CREATE TYPE project_status AS ENUM ('pending', 'in_progress', 'completed', 'delivered');

-- Payment status enumeration
CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'paid');

-- =====================================================
-- STORAGE BUCKETS SETUP
-- =====================================================

-- Create avatars bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- MAIN TABLES
-- =====================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS project_timeline CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_clients CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type project_type NOT NULL DEFAULT 'personal',
  status project_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  budget DECIMAL(10,2),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project-clients junction table (many-to-many relationship)
CREATE TABLE project_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  reference_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, client_id)
);

-- Tasks table for project task management
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project timeline table for tracking progress milestones
CREATE TABLE project_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  milestone TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_payment_status ON projects(payment_status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Project timeline indexes
CREATE INDEX IF NOT EXISTS idx_project_timeline_project_id ON project_timeline(project_id);
CREATE INDEX IF NOT EXISTS idx_project_timeline_order ON project_timeline(order_index);

-- Project clients indexes
CREATE INDEX IF NOT EXISTS idx_project_clients_project_id ON project_clients(project_id);
CREATE INDEX IF NOT EXISTS idx_project_clients_client_id ON project_clients(client_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS calculate_project_progress(UUID) CASCADE;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to calculate project completion percentage based on tasks
CREATE OR REPLACE FUNCTION calculate_project_progress(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    progress_percentage INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tasks FROM tasks WHERE project_id = project_uuid;
    
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO completed_tasks FROM tasks WHERE project_id = project_uuid AND completed = TRUE;
    
    progress_percentage := ROUND((completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100);
    
    RETURN progress_percentage;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for clients updated_at
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for tasks updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user profile creation (MOST IMPORTANT!)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_timeline ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- PROJECTS RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CLIENTS RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

-- Clients policies
CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PROJECT_CLIENTS RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own project clients" ON project_clients;
DROP POLICY IF EXISTS "Users can manage own project clients" ON project_clients;

-- Project-clients junction policies
CREATE POLICY "Users can view own project clients" ON project_clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_clients.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own project clients" ON project_clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_clients.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- =====================================================
-- TASKS RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own project tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage own project tasks" ON tasks;

-- Tasks policies
CREATE POLICY "Users can view own project tasks" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own project tasks" ON tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- =====================================================
-- PROJECT_TIMELINE RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own project timeline" ON project_timeline;
DROP POLICY IF EXISTS "Users can manage own project timeline" ON project_timeline;

-- Project timeline policies
CREATE POLICY "Users can view own project timeline" ON project_timeline
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_timeline.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own project timeline" ON project_timeline
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_timeline.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS projects_with_clients;
DROP VIEW IF EXISTS project_stats;

-- View for projects with client information
CREATE VIEW projects_with_clients AS
SELECT 
    p.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', c.id,
                'name', c.name,
                'email', c.email,
                'company', c.company
            )
        ) FILTER (WHERE c.id IS NOT NULL), 
        '[]'::json
    ) as clients
FROM projects p
LEFT JOIN project_clients pc ON p.id = pc.project_id
LEFT JOIN clients c ON pc.client_id = c.id
GROUP BY p.id;

-- View for project statistics
CREATE VIEW project_stats AS
SELECT 
    user_id,
    COUNT(*) as total_projects,
    COUNT(*) FILTER (WHERE status = 'in_progress') as active_projects,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_projects,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered_projects,
    COALESCE(SUM(budget), 0) as total_budget,
    COALESCE(SUM(paid_amount), 0) as total_revenue,
    COALESCE(AVG(progress), 0) as average_progress
FROM projects
GROUP BY user_id;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Log successful completion
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'DevFlow Dashboard database schema setup completed successfully!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tables created: profiles, projects, clients, project_clients, tasks, project_timeline';
    RAISE NOTICE 'Storage bucket created: avatars (5MB limit)';
    RAISE NOTICE 'RLS policies enabled for all tables';
    RAISE NOTICE 'Triggers created for automatic profile creation';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Views created for analytics';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'IMPORTANT: Set up storage policies manually in Supabase Dashboard';
    RAISE NOTICE 'Go to Storage > Policies and create policies for avatars bucket';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Ready for account creation testing!';
    RAISE NOTICE 'Create a new account to test the profile trigger';
    RAISE NOTICE '==============================================';
END $$;
