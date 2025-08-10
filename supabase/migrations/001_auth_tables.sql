-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student', 'guest');
CREATE TYPE audit_severity AS ENUM ('info', 'warning', 'error', 'critical');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role user_role DEFAULT 'student',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  account_locked BOOLEAN DEFAULT FALSE,
  locked_until TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- Create user_roles table for role management
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, role)
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Create user_permissions table for custom permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, permission_id)
);

-- Create sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  severity audit_severity DEFAULT 'info',
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  device_type TEXT,
  location TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create login_attempts table for tracking failed logins
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT FALSE,
  failure_reason TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  ip_address INET
);

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ
);

-- Create mfa_factors table
CREATE TABLE IF NOT EXISTS mfa_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  factor_type TEXT NOT NULL,
  secret TEXT,
  backup_codes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_factors ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- User roles policies
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (user_id = auth.uid());

-- Create functions
CREATE OR REPLACE FUNCTION check_permission(
  p_user_id UUID,
  p_permission_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  -- Check if user has permission through role
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.name = p_permission_name
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  ) INTO v_has_permission;
  
  IF v_has_permission THEN
    RETURN true;
  END IF;
  
  -- Check if user has direct permission
  SELECT EXISTS (
    SELECT 1
    FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id
      AND p.name = p_permission_name
      AND up.is_active = true
      AND (up.expires_at IS NULL OR up.expires_at > NOW())
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('view_all_content', 'View all learning content', 'content', 'read'),
  ('edit_all_content', 'Edit all learning content', 'content', 'write'),
  ('delete_all_content', 'Delete all learning content', 'content', 'delete'),
  ('manage_users', 'Manage user accounts', 'users', 'manage'),
  ('view_audit_logs', 'View audit logs', 'audit', 'read'),
  ('manage_settings', 'Manage application settings', 'settings', 'manage'),
  ('export_data', 'Export application data', 'data', 'export'),
  ('import_data', 'Import application data', 'data', 'import'),
  ('view_student_progress', 'View student progress', 'progress', 'read'),
  ('grade_exams', 'Grade student exams', 'exams', 'grade'),
  ('manage_groups', 'Manage study groups', 'groups', 'manage'),
  ('create_content', 'Create new content', 'content', 'create'),
  ('edit_own_content', 'Edit own content', 'content', 'edit_own'),
  ('view_content', 'View content', 'content', 'read'),
  ('take_exams', 'Take exams', 'exams', 'take'),
  ('view_own_progress', 'View own progress', 'progress', 'read_own'),
  ('join_groups', 'Join study groups', 'groups', 'join'),
  ('create_notes', 'Create notes', 'notes', 'create'),
  ('export_own_data', 'Export own data', 'data', 'export_own'),
  ('view_public_content', 'View public content', 'content', 'read_public')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Admin permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions
WHERE name IN (
  'view_all_content', 'edit_all_content', 'delete_all_content',
  'manage_users', 'view_audit_logs', 'manage_settings',
  'export_data', 'import_data'
) ON CONFLICT DO NOTHING;

-- Instructor permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'instructor', id FROM permissions
WHERE name IN (
  'view_all_content', 'edit_own_content', 'create_content',
  'view_student_progress', 'grade_exams', 'manage_groups', 'export_data'
) ON CONFLICT DO NOTHING;

-- Student permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'student', id FROM permissions
WHERE name IN (
  'view_content', 'take_exams', 'view_own_progress',
  'join_groups', 'create_notes', 'export_own_data'
) ON CONFLICT DO NOTHING;

-- Guest permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'guest', id FROM permissions
WHERE name = 'view_public_content'
ON CONFLICT DO NOTHING;