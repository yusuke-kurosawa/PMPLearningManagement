-- AI Learning System Tables
-- Migration for AI-powered personalized learning features

-- User Memory Profiles table
CREATE TABLE IF NOT EXISTS user_memory_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preferences
  preferences JSONB NOT NULL DEFAULT '{
    "learningStyle": "mixed",
    "responseLength": "balanced",
    "difficultyPreference": "intermediate",
    "languageStyle": "formal"
  }'::jsonb,
  
  -- Knowledge tracking
  knowledge JSONB NOT NULL DEFAULT '{
    "strongAreas": [],
    "weakAreas": [],
    "recentTopics": [],
    "masteredConcepts": []
  }'::jsonb,
  
  -- Interaction statistics
  interaction JSONB NOT NULL DEFAULT '{
    "totalSessions": 0,
    "totalTurns": 0,
    "averageSessionLength": 0,
    "lastInteraction": null,
    "preferredTimeOfDay": null
  }'::jsonb,
  
  -- Goals
  goals JSONB NOT NULL DEFAULT '{
    "examDate": null,
    "targetScore": 75,
    "dailyStudyTime": 60,
    "focusAreas": []
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Conversation Sessions table
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  topic VARCHAR(255),
  summary TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Turns table
CREATE TABLE IF NOT EXISTS conversation_turns (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Analytics table
CREATE TABLE IF NOT EXISTS learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Progress metrics
  overall_score DECIMAL(5,2),
  knowledge_area_scores JSONB,
  process_group_scores JSONB,
  
  -- Activity metrics
  study_time_minutes INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  topics_covered TEXT[],
  
  -- Performance insights
  strengths TEXT[],
  weaknesses TEXT[],
  improvement_rate DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Study Plans table
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  exam_date DATE,
  target_score INTEGER,
  
  -- Plan configuration
  days_until_exam INTEGER,
  total_study_hours INTEGER,
  daily_hours DECIMAL(3,1),
  
  -- Plan content
  phases JSONB,
  weekly_schedule JSONB,
  milestones JSONB,
  resource_allocation JSONB,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Recommendations table
CREATE TABLE IF NOT EXISTS study_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Recommendation details
  type VARCHAR(50) NOT NULL CHECK (type IN ('flashcard', 'mock_exam', 'reading', 'video', 'practice')),
  topic VARCHAR(255) NOT NULL,
  knowledge_area VARCHAR(100),
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  
  -- Metadata
  estimated_time_minutes INTEGER,
  priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
  reason TEXT,
  resources JSONB,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'started', 'completed', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  
  -- Quiz details
  quiz_type VARCHAR(50) NOT NULL,
  questions JSONB NOT NULL,
  answers JSONB NOT NULL,
  
  -- Results
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  time_taken_seconds INTEGER,
  
  -- Analysis
  topics_tested TEXT[],
  weak_areas_identified TEXT[],
  strong_areas_identified TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Resources table
CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Resource information
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url TEXT,
  content TEXT,
  
  -- Categorization
  knowledge_area VARCHAR(100),
  process_group VARCHAR(100),
  topic VARCHAR(255),
  difficulty VARCHAR(20),
  
  -- Metadata
  metadata JSONB,
  tags TEXT[],
  
  -- Usage tracking
  view_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Resource Progress table
CREATE TABLE IF NOT EXISTS user_resource_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  
  -- Progress tracking
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  
  -- User interaction
  notes TEXT,
  bookmarked BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  last_accessed TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, resource_id)
);

-- Indexes for performance
CREATE INDEX idx_user_memory_profiles_user_id ON user_memory_profiles(user_id);
CREATE INDEX idx_conversation_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX idx_conversation_sessions_start_time ON conversation_sessions(start_time DESC);
CREATE INDEX idx_conversation_turns_user_id ON conversation_turns(user_id);
CREATE INDEX idx_conversation_turns_session_id ON conversation_turns(session_id);
CREATE INDEX idx_conversation_turns_timestamp ON conversation_turns(timestamp DESC);
CREATE INDEX idx_learning_analytics_user_date ON learning_analytics(user_id, date DESC);
CREATE INDEX idx_study_plans_user_status ON study_plans(user_id, status);
CREATE INDEX idx_study_recommendations_user_status ON study_recommendations(user_id, status);
CREATE INDEX idx_quiz_results_user_created ON quiz_results(user_id, created_at DESC);
CREATE INDEX idx_user_resource_progress_user_status ON user_resource_progress(user_id, status);

-- Full-text search indexes
CREATE INDEX idx_conversation_turns_content_search ON conversation_turns USING gin(to_tsvector('english', content));
CREATE INDEX idx_learning_resources_search ON learning_resources USING gin(
  to_tsvector('english', title || ' ' || COALESCE(content, ''))
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_memory_profiles_updated_at
  BEFORE UPDATE ON user_memory_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_sessions_updated_at
  BEFORE UPDATE ON conversation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_analytics_updated_at
  BEFORE UPDATE ON learning_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_plans_updated_at
  BEFORE UPDATE ON study_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_recommendations_updated_at
  BEFORE UPDATE ON study_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_resources_updated_at
  BEFORE UPDATE ON learning_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_resource_progress_updated_at
  BEFORE UPDATE ON user_resource_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE user_memory_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resource_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_memory_profiles
CREATE POLICY user_memory_profiles_select ON user_memory_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_memory_profiles_insert ON user_memory_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_memory_profiles_update ON user_memory_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_memory_profiles_delete ON user_memory_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for conversation_sessions
CREATE POLICY conversation_sessions_select ON conversation_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY conversation_sessions_insert ON conversation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY conversation_sessions_update ON conversation_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY conversation_sessions_delete ON conversation_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for conversation_turns
CREATE POLICY conversation_turns_select ON conversation_turns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY conversation_turns_insert ON conversation_turns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY conversation_turns_delete ON conversation_turns
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for learning_analytics
CREATE POLICY learning_analytics_select ON learning_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY learning_analytics_insert ON learning_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY learning_analytics_update ON learning_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for study_plans
CREATE POLICY study_plans_select ON study_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY study_plans_insert ON study_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY study_plans_update ON study_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY study_plans_delete ON study_plans
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for study_recommendations
CREATE POLICY study_recommendations_select ON study_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY study_recommendations_insert ON study_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY study_recommendations_update ON study_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for quiz_results
CREATE POLICY quiz_results_select ON quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY quiz_results_insert ON quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_resource_progress
CREATE POLICY user_resource_progress_select ON user_resource_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_resource_progress_insert ON user_resource_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_resource_progress_update ON user_resource_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for learning_resources
CREATE POLICY learning_resources_select ON learning_resources
  FOR SELECT USING (true);

-- Admin-only write access for learning_resources (implement admin check as needed)
CREATE POLICY learning_resources_insert ON learning_resources
  FOR INSERT WITH CHECK (false); -- Modify this based on your admin logic

CREATE POLICY learning_resources_update ON learning_resources
  FOR UPDATE USING (false); -- Modify this based on your admin logic

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;