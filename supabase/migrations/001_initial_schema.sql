-- ============================================
-- CROWDTUNER DATABASE SCHEMA v2.1
-- Run this in your Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- TV BRANDS
-- ============================================
CREATE TABLE tv_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    aliases TEXT[] DEFAULT '{}',
    default_menu_path JSONB,
    settings_naming_quirks JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TV MODELS
-- ============================================
CREATE TABLE tv_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES tv_brands(id),
    model_number VARCHAR(100) NOT NULL,
    model_aliases TEXT[] DEFAULT '{}',
    display_name VARCHAR(200),
    year INTEGER,
    panel_type VARCHAR(50),
    resolution VARCHAR(20),
    smart_platform VARCHAR(50),
    research_confidence DECIMAL(3,2) DEFAULT 0.00,
    research_sources TEXT[],
    last_researched_at TIMESTAMPTZ,
    total_sessions INTEGER DEFAULT 0,
    successful_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, model_number)
);

CREATE INDEX idx_tv_models_search ON tv_models
    USING gin (model_number gin_trgm_ops);

-- ============================================
-- TV SETTINGS METADATA
-- ============================================
CREATE TABLE tv_settings_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES tv_models(id) ON DELETE CASCADE,
    setting_name VARCHAR(100) NOT NULL,
    setting_category VARCHAR(50) NOT NULL,
    setting_type VARCHAR(20) NOT NULL,
    range_min DECIMAL,
    range_max DECIMAL,
    dropdown_options TEXT[],
    default_value VARCHAR(50),
    recommended_bright_room VARCHAR(50),
    recommended_dim_room VARCHAR(50),
    recommended_dark_room VARCHAR(50),
    menu_path TEXT[],
    actual_function TEXT,
    affects TEXT[],
    source VARCHAR(50),
    confidence DECIMAL(3,2) DEFAULT 0.50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(model_id, setting_name)
);

-- ============================================
-- CALIBRATION PATTERNS
-- ============================================
CREATE TABLE patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    youtube_url TEXT,
    website_url TEXT,
    short_code VARCHAR(10) UNIQUE,
    analysis_prompt TEXT NOT NULL,
    tests_settings TEXT[],
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CALIBRATION SESSIONS
-- ============================================
CREATE TABLE calibration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    device_id VARCHAR(255),
    model_id UUID REFERENCES tv_models(id),
    model_number_entered VARCHAR(200),
    environment JSONB NOT NULL,
    mode VARCHAR(20),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    final_satisfaction INTEGER CHECK (final_satisfaction BETWEEN 1 AND 5),
    final_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SESSION CHECKPOINTS
-- ============================================
CREATE TABLE session_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES calibration_sessions(id) ON DELETE CASCADE,
    checkpoint_number INTEGER NOT NULL,
    label VARCHAR(200),
    settings JSONB NOT NULL,
    pattern_id UUID REFERENCES patterns(id),
    capture_image_url TEXT,
    ai_analysis JSONB,
    user_feedback JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, checkpoint_number)
);

CREATE INDEX idx_checkpoints_session ON session_checkpoints(session_id);

-- ============================================
-- LEARNED SOLUTIONS
-- ============================================
CREATE TABLE learned_solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES tv_models(id) ON DELETE CASCADE,
    pattern_id UUID REFERENCES patterns(id),
    environment_type VARCHAR(50),
    issue_type VARCHAR(100) NOT NULL,
    issue_description TEXT,
    setting_changes JSONB NOT NULL,
    times_recommended INTEGER DEFAULT 0,
    times_applied INTEGER DEFAULT 0,
    times_successful INTEGER DEFAULT 0,
    times_rolled_back INTEGER DEFAULT 0,
    average_satisfaction DECIMAL(3,2),
    confidence_score DECIMAL(3,2) DEFAULT 0.50,
    positive_feedback TEXT[],
    negative_feedback TEXT[],
    refinement_rules JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(model_id, pattern_id, environment_type, issue_type)
);

CREATE INDEX idx_solutions_lookup ON learned_solutions(model_id, pattern_id, environment_type);

-- ============================================
-- LEARNING EVENTS
-- ============================================
CREATE TABLE learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES calibration_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    context JSONB,
    insight_generated TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS (Optional)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(100),
    saved_tvs UUID[] DEFAULT '{}',
    contribution_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI RESEARCH CACHE
-- ============================================
CREATE TABLE ai_research_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_hash VARCHAR(64) UNIQUE,
    query_text TEXT,
    response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- ============================================
-- SEED DATA: Patterns
-- ============================================
INSERT INTO patterns (name, slug, short_code, category, description, tests_settings, analysis_prompt) VALUES
(
    'Black Level (PLUGE)',
    'black-level',
    'b1',
    'brightness',
    'Tests if your Brightness setting is correct by showing near-black test bars.',
    ARRAY['brightness', 'black_tone', 'shadow_detail', 'gamma'],
    'Analyze this PLUGE pattern. Look for near-black bars at 2%, 4%, 6% gray against reference black. Correct: 2% invisible, 4% barely visible, 6% clearly visible. If 2% visible = brightness too high. If 4% invisible = brightness too low.'
),
(
    'White Clipping (Contrast)',
    'white-clipping',
    'c1',
    'contrast',
    'Tests if your Contrast setting is correct by showing near-white test bars.',
    ARRAY['contrast', 'dynamic_contrast', 'contrast_enhancer'],
    'Analyze this contrast pattern. Look for near-white bars at 95%, 97%, 99% against reference white. Correct: All bars distinguishable, 99% barely visible. If bars merged/invisible = contrast too high.'
),
(
    'Color Accuracy',
    'color-bars',
    'cb1',
    'color',
    'Tests color saturation and accuracy using standard color bars.',
    ARRAY['color', 'tint', 'color_space', 'color_temperature'],
    'Analyze these SMPTE color bars. Check saturation (not over/under) and look for color tinting in white/gray sections.'
),
(
    'Grayscale Ramp',
    'grayscale',
    'g1',
    'color',
    'Tests for color tinting across the brightness range.',
    ARRAY['color_temperature', 'white_balance', 'tint'],
    'Analyze this grayscale gradient. Look for any color tinting (pink, green, blue) at any brightness level. Should be neutral gray throughout.'
),
(
    'Sharpness Test',
    'sharpness',
    's1',
    'sharpness',
    'Tests if Sharpness creates edge artifacts.',
    ARRAY['sharpness', 'edge_enhancement'],
    'Analyze this sharpness pattern. Look for white halos or ringing around lines indicating over-sharpening. Lines should be clean without artifacts.'
);

-- ============================================
-- SEED DATA: Brands
-- ============================================
INSERT INTO tv_brands (name, aliases, settings_naming_quirks) VALUES
('Samsung', ARRAY['SAMSUNG', 'samsung'], '{"brightness": "Controls black level, not overall brightness", "backlight": "Controls overall brightness"}'),
('LG', ARRAY['lg', 'L.G.'], '{"oled_light": "Overall brightness for OLED panels", "brightness": "Black level control"}'),
('Sony', ARRAY['SONY', 'sony', 'BRAVIA'], '{"brightness": "Standard black level control"}'),
('TCL', ARRAY['tcl'], '{}'),
('Hisense', ARRAY['HISENSE', 'hisense'], '{}'),
('Vizio', ARRAY['VIZIO', 'vizio'], '{}'),
('Roku TV', ARRAY['Roku', 'roku'], '{}');

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE calibration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access to read patterns and solutions
CREATE POLICY "Public read patterns" ON patterns FOR SELECT USING (true);
CREATE POLICY "Public read solutions" ON learned_solutions FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON tv_brands FOR SELECT USING (true);
CREATE POLICY "Public read models" ON tv_models FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON tv_settings_metadata FOR SELECT USING (true);

-- Allow inserting sessions and checkpoints (for anonymous users too)
CREATE POLICY "Anyone can create sessions" ON calibration_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read own sessions" ON calibration_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can update own sessions" ON calibration_sessions FOR UPDATE USING (true);

CREATE POLICY "Anyone can create checkpoints" ON session_checkpoints FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read checkpoints" ON session_checkpoints FOR SELECT USING (true);

CREATE POLICY "Anyone can create learning events" ON learning_events FOR INSERT WITH CHECK (true);

-- Allow inserting new models and solutions (crowd contribution)
CREATE POLICY "Anyone can add models" ON tv_models FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can add settings" ON tv_settings_metadata FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can add solutions" ON learned_solutions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update solutions" ON learned_solutions FOR UPDATE USING (true);
