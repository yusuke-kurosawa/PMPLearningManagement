-- PMBOK Knowledge Area Management Database Schema
-- PostgreSQL 15+ with full-text search and JSONB support

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create enum types
CREATE TYPE pmbok_version AS ENUM ('6', '7');
CREATE TYPE process_complexity AS ENUM ('low', 'medium', 'high');
CREATE TYPE relationship_type AS ENUM ('dependency', 'prerequisite', 'related', 'successor');
CREATE TYPE itto_type AS ENUM ('input', 'tool', 'output');
CREATE TYPE mastery_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Knowledge Areas table
CREATE TABLE knowledge_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    pmbok_version pmbok_version NOT NULL,
    process_count INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(7) CHECK (color ~ '^#[0-9A-F]{6}$'),
    icon VARCHAR(50),
    display_order INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT uk_knowledge_area_code_version UNIQUE (code, pmbok_version),
    CONSTRAINT chk_process_count CHECK (process_count >= 0)
);

-- Process Groups table
CREATE TABLE process_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    process_count INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(7) CHECK (color ~ '^#[0-9A-F]{6}$'),
    icon VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uk_process_group_code UNIQUE (code),
    CONSTRAINT chk_pg_process_count CHECK (process_count >= 0)
);

-- Processes table
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    knowledge_area_id UUID NOT NULL REFERENCES knowledge_areas(id) ON DELETE CASCADE,
    process_group_id UUID NOT NULL REFERENCES process_groups(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    purpose TEXT,
    key_benefits TEXT[],
    display_order INTEGER NOT NULL DEFAULT 0,
    complexity process_complexity DEFAULT 'medium',
    estimated_learning_time INTEGER, -- in minutes
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    search_vector tsvector,
    is_active BOOLEAN DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT uk_process_code_ka_pg UNIQUE (code, knowledge_area_id, process_group_id),
    CONSTRAINT chk_learning_time CHECK (estimated_learning_time > 0)
);

-- ITTO Items table (normalized)
CREATE TABLE itto_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type itto_type NOT NULL,
    category VARCHAR(100),
    description TEXT,
    is_enterprise BOOLEAN DEFAULT false,
    is_organizational BOOLEAN DEFAULT false,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    search_vector tsvector,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uk_itto_item_name_type UNIQUE (name, type)
);

-- Process ITTO mapping table
CREATE TABLE process_itto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    itto_item_id UUID NOT NULL REFERENCES itto_items(id) ON DELETE CASCADE,
    itto_type itto_type NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uk_process_itto UNIQUE (process_id, itto_item_id, itto_type)
);

-- Process Relationships table
CREATE TABLE process_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    target_process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    relationship_type relationship_type NOT NULL,
    strength DECIMAL(3,2) CHECK (strength >= 0 AND strength <= 1),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uk_process_relationship UNIQUE (source_process_id, target_process_id, relationship_type),
    CONSTRAINT chk_different_processes CHECK (source_process_id != target_process_id)
);

-- User Progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    mastery_level mastery_level DEFAULT 'beginner',
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    score DECIMAL(5,2),
    attempts INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in minutes
    last_accessed TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uk_user_process UNIQUE (user_id, process_id),
    CONSTRAINT chk_completion CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    CONSTRAINT chk_score CHECK (score >= 0 AND score <= 100),
    CONSTRAINT chk_attempts CHECK (attempts >= 0),
    CONSTRAINT chk_time_spent CHECK (time_spent >= 0)
);

-- Learning Paths table
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty_level process_complexity DEFAULT 'medium',
    estimated_duration INTEGER, -- in hours
    prerequisites TEXT[],
    target_roles TEXT[],
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    -- Constraints
    CONSTRAINT chk_duration CHECK (estimated_duration > 0)
);

-- Learning Path Steps table
CREATE TABLE learning_path_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    is_optional BOOLEAN DEFAULT false,
    estimated_time INTEGER, -- in minutes
    description TEXT,
    success_criteria JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uk_path_step UNIQUE (learning_path_id, step_order),
    CONSTRAINT chk_step_order CHECK (step_order > 0),
    CONSTRAINT chk_step_time CHECK (estimated_time > 0)
);

-- Process Versions table (for audit trail)
CREATE TABLE process_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    changes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    -- Constraints
    CONSTRAINT uk_process_version UNIQUE (process_id, version_number)
);

-- Analytics Events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization

-- Knowledge Areas indexes
CREATE INDEX idx_ka_pmbok_version ON knowledge_areas(pmbok_version);
CREATE INDEX idx_ka_active ON knowledge_areas(is_active) WHERE is_active = true;
CREATE INDEX idx_ka_metadata ON knowledge_areas USING GIN (metadata);

-- Process Groups indexes
CREATE INDEX idx_pg_active ON process_groups(is_active) WHERE is_active = true;
CREATE INDEX idx_pg_display_order ON process_groups(display_order);

-- Processes indexes
CREATE INDEX idx_process_ka ON processes(knowledge_area_id);
CREATE INDEX idx_process_pg ON processes(process_group_id);
CREATE INDEX idx_process_complexity ON processes(complexity);
CREATE INDEX idx_process_tags ON processes USING GIN (tags);
CREATE INDEX idx_process_metadata ON processes USING GIN (metadata);
CREATE INDEX idx_process_search ON processes USING GIN (search_vector);
CREATE INDEX idx_process_active ON processes(is_active) WHERE is_active = true;

-- ITTO indexes
CREATE INDEX idx_itto_type ON itto_items(type);
CREATE INDEX idx_itto_category ON itto_items(category);
CREATE INDEX idx_itto_tags ON itto_items USING GIN (tags);
CREATE INDEX idx_itto_search ON itto_items USING GIN (search_vector);

-- Process ITTO indexes
CREATE INDEX idx_process_itto_process ON process_itto(process_id);
CREATE INDEX idx_process_itto_item ON process_itto(itto_item_id);
CREATE INDEX idx_process_itto_type ON process_itto(itto_type);
CREATE INDEX idx_process_itto_primary ON process_itto(is_primary) WHERE is_primary = true;

-- Relationships indexes
CREATE INDEX idx_rel_source ON process_relationships(source_process_id);
CREATE INDEX idx_rel_target ON process_relationships(target_process_id);
CREATE INDEX idx_rel_type ON process_relationships(relationship_type);

-- User Progress indexes
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_process ON user_progress(process_id);
CREATE INDEX idx_progress_mastery ON user_progress(mastery_level);
CREATE INDEX idx_progress_last_accessed ON user_progress(last_accessed DESC);
CREATE INDEX idx_progress_user_process ON user_progress(user_id, process_id);

-- Learning Path indexes
CREATE INDEX idx_lp_active ON learning_paths(is_active) WHERE is_active = true;
CREATE INDEX idx_lp_difficulty ON learning_paths(difficulty_level);
CREATE INDEX idx_lp_tags ON learning_paths USING GIN (tags);

-- Analytics indexes
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_entity ON analytics_events(entity_type, entity_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);

-- Full-text search configuration
CREATE TEXT SEARCH CONFIGURATION pmbok_search (COPY = english);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ka_updated_at BEFORE UPDATE ON knowledge_areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pg_updated_at BEFORE UPDATE ON process_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_updated_at BEFORE UPDATE ON processes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itto_updated_at BEFORE UPDATE ON itto_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rel_updated_at BEFORE UPDATE ON process_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lp_updated_at BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for search vector updates
CREATE OR REPLACE FUNCTION update_process_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('pmbok_search', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('pmbok_search', coalesce(NEW.code, '')), 'B') ||
        setweight(to_tsvector('pmbok_search', coalesce(NEW.description, '')), 'C') ||
        setweight(to_tsvector('pmbok_search', coalesce(NEW.purpose, '')), 'D');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_process_search BEFORE INSERT OR UPDATE ON processes
    FOR EACH ROW EXECUTE FUNCTION update_process_search_vector();

CREATE OR REPLACE FUNCTION update_itto_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('pmbok_search', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('pmbok_search', coalesce(NEW.category, '')), 'B') ||
        setweight(to_tsvector('pmbok_search', coalesce(NEW.description, '')), 'C');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_itto_search BEFORE INSERT OR UPDATE ON itto_items
    FOR EACH ROW EXECUTE FUNCTION update_itto_search_vector();

-- Materialized views for performance

-- Knowledge Area Statistics
CREATE MATERIALIZED VIEW mv_knowledge_area_stats AS
SELECT 
    ka.id,
    ka.name,
    ka.code,
    COUNT(DISTINCT p.id) as total_processes,
    COUNT(DISTINCT pi.itto_item_id) as total_itto_items,
    AVG(p.estimated_learning_time) as avg_learning_time,
    COUNT(DISTINCT pr.target_process_id) as total_relationships
FROM knowledge_areas ka
LEFT JOIN processes p ON ka.id = p.knowledge_area_id
LEFT JOIN process_itto pi ON p.id = pi.process_id
LEFT JOIN process_relationships pr ON p.id = pr.source_process_id
WHERE ka.is_active = true
GROUP BY ka.id, ka.name, ka.code;

CREATE UNIQUE INDEX idx_mv_ka_stats_id ON mv_knowledge_area_stats(id);

-- Process Group Statistics
CREATE MATERIALIZED VIEW mv_process_group_stats AS
SELECT 
    pg.id,
    pg.name,
    pg.code,
    COUNT(DISTINCT p.id) as total_processes,
    COUNT(DISTINCT p.knowledge_area_id) as total_knowledge_areas,
    AVG(p.estimated_learning_time) as avg_learning_time
FROM process_groups pg
LEFT JOIN processes p ON pg.id = p.process_group_id
WHERE pg.is_active = true
GROUP BY pg.id, pg.name, pg.code;

CREATE UNIQUE INDEX idx_mv_pg_stats_id ON mv_process_group_stats(id);

-- User Progress Summary
CREATE MATERIALIZED VIEW mv_user_progress_summary AS
SELECT 
    up.user_id,
    p.knowledge_area_id,
    ka.name as knowledge_area_name,
    COUNT(DISTINCT up.process_id) as processes_attempted,
    AVG(up.completion_percentage) as avg_completion,
    AVG(up.score) as avg_score,
    SUM(up.time_spent) as total_time_spent,
    MAX(up.last_accessed) as last_activity
FROM user_progress up
JOIN processes p ON up.process_id = p.id
JOIN knowledge_areas ka ON p.knowledge_area_id = ka.id
GROUP BY up.user_id, p.knowledge_area_id, ka.name;

CREATE UNIQUE INDEX idx_mv_user_progress_user_ka ON mv_user_progress_summary(user_id, knowledge_area_id);

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_knowledge_area_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_process_group_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_progress_summary;
END;
$$ language 'plpgsql';

-- Schedule periodic refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-materialized-views', '0 */6 * * *', 'SELECT refresh_all_materialized_views();');