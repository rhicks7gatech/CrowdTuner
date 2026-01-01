# CrowdTuner Platform - Technical Design Document v2.1

## Executive Summary

CrowdTuner is an **AI-powered TV calibration assistant** that works like a knowledgeable friend helping you tune your TV. Through conversation, pattern analysis, and iterative refinement, it guides ANY user with ANY TV to their ideal picture settings—while learning from every interaction to help future users.

**Core Philosophy**:
- AI proposes, user disposes
- Technical correctness ≠ user happiness (subjective feedback matters)
- Every session teaches the system something new
- Users can always go back

---

## 1. The Core Loop (TLDR)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE CALIBRATION CONVERSATION                        │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │  1. IDENTIFY TV  │  User: "Samsung UN55TU8000"
    └────────┬─────────┘  AI researches settings, menus, ranges
             │
             ▼
    ┌──────────────────┐
    │  2. ENVIRONMENT  │  "Dim room, evening viewing, 8ft away"
    └────────┬─────────┘  AI factors this into all recommendations
             │
             ▼
    ┌──────────────────┐
    │  3. BASELINE     │  User enters current settings
    │     CHECKPOINT   │  AI saves as "Checkpoint 0 - Original"
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                    ITERATIVE REFINEMENT LOOP                 │
    │  ┌────────────────────────────────────────────────────────┐  │
    │  │                                                        │  │
    │  │   4. DISPLAY PATTERN ──► User shows pattern on TV     │  │
    │  │            │                                          │  │
    │  │            ▼                                          │  │
    │  │   5. CAPTURE ──► User takes photo with phone          │  │
    │  │            │                                          │  │
    │  │            ▼                                          │  │
    │  │   6. AI ANALYZES ──► "Blacks look gray, try            │  │
    │  │            │          lowering Brightness to 45"      │  │
    │  │            ▼                                          │  │
    │  │   7. USER ADJUSTS ──► Makes change, confirms value    │  │
    │  │            │                                          │  │
    │  │            ▼                                          │  │
    │  │   8. SAVE CHECKPOINT ──► "Checkpoint 1 - Brightness   │  │
    │  │            │               lowered"                   │  │
    │  │            ▼                                          │  │
    │  │   9. CAPTURE AGAIN ──► Verify the change              │  │
    │  │            │                                          │  │
    │  │            ▼                                          │  │
    │  │   10. AI + USER FEEDBACK ◄─────────────────────────┐  │  │
    │  │            │                                       │  │  │
    │  │            ├──► "Looks correct AND feels good"     │  │  │
    │  │            │     ──► Move to next setting ─────────┼──┼──►
    │  │            │                                       │  │  │
    │  │            ├──► "Looks correct but feels wrong"    │  │  │
    │  │            │     User: "Too dark overall"          │  │  │
    │  │            │     ──► AI adjusts approach ──────────┘  │  │
    │  │            │                                          │  │
    │  │            └──► "I want to go back"                   │  │
    │  │                  ──► Restore checkpoint ──────────────┘  │
    │  │                                                          │
    │  └──────────────────────────────────────────────────────────┘
    │                          │
    └──────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
    ┌──────────────────────────────────────────────────────────────┐
    │  11. SESSION COMPLETE                                        │
    │                                                              │
    │  • Final settings saved                                      │
    │  • User satisfaction recorded                                │
    │  • AI learns from the entire journey                         │
    │  • Next user with same TV + environment = faster fix         │
    └──────────────────────────────────────────────────────────────┘
```

---

## 2. The Checkpoint System

Every settings change is saved so users can always go back.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SESSION TIMELINE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Time ───────────────────────────────────────────────────────────────────────►

 CHECKPOINT 0          CHECKPOINT 1          CHECKPOINT 2          FINAL
 ═══════════          ════════════          ════════════          ═════

 ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
 │ ORIGINAL    │      │ First Try   │      │ Adjusted    │      │ User Happy  │
 │             │      │             │      │             │      │             │
 │ Brightness: │      │ Brightness: │      │ Brightness: │      │ Brightness: │
 │     50      │ ───► │     45      │ ───► │     47      │ ───► │     47      │
 │             │      │             │      │             │      │             │
 │ Backlight:  │      │ Backlight:  │      │ Backlight:  │      │ Backlight:  │
 │     8       │      │     8       │      │     10      │      │     10      │
 │             │      │             │      │             │      │             │
 │ Contrast:   │      │ Contrast:   │      │ Contrast:   │      │ Contrast:   │
 │     45      │      │     45      │      │     45      │      │     45      │
 └─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
 ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
 │ AI Analysis │      │ AI Analysis │      │ AI Analysis │      │ Saved to    │
 │ "Blacks are │      │ "Pattern    │      │ "Pattern    │      │ database    │
 │  gray"      │      │  correct"   │      │  correct"   │      │ for future  │
 │             │      │             │      │             │      │ users       │
 │ User said:  │      │ User said:  │      │ User said:  │      │             │
 │ "Starting"  │      │ "Too dark,  │      │ "Perfect!"  │      │ ★★★★★      │
 │             │      │  can't see  │      │             │      │             │
 │             │      │  details"   │      │             │      │             │
 └─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
                            │
                            │ User could say:
                            │ "Go back to original"
                            │         │
                            ▼         ▼
                      ┌─────────────────────┐
                      │ ROLLBACK AVAILABLE  │
                      │ Any checkpoint can  │
                      │ be restored         │
                      └─────────────────────┘
```

### Checkpoint Data Structure

```typescript
interface Checkpoint {
  id: string;
  number: number;                    // 0, 1, 2, etc.
  timestamp: Date;
  label: string;                     // "Original", "Lowered Brightness", etc.

  // The settings at this point
  settings: {
    brightness: number;
    contrast: number;
    backlight: number;
    color: number;
    tint: number | string;
    sharpness: number;
    // ... any other settings captured
    [key: string]: number | string;
  };

  // What happened here
  patternCapture?: {
    imageUrl: string;
    patternType: string;             // 'black-level', 'contrast', etc.
  };

  aiAnalysis?: {
    patternResult: string;           // What AI saw in the pattern
    recommendation: string;          // What AI suggested
    confidence: number;              // 0-1
  };

  userFeedback?: {
    applied: boolean;                // Did they make the suggested change?
    subjectiveResponse: string;      // "too dark", "perfect", "weird", etc.
    wantsToGoBack: boolean;          // Did they request rollback?
    customNotes?: string;            // Any other feedback
  };
}
```

---

## 3. The AI Learning System

The AI learns from every session to improve recommendations for future users.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HOW THE AI LEARNS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

                         SINGLE SESSION DATA
                         ═══════════════════
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    │                             │                             │
    ▼                             ▼                             ▼

┌─────────────┐           ┌─────────────┐           ┌─────────────┐
│  PATTERN    │           │    USER     │           │  CONTEXT    │
│  ANALYSIS   │           │  FEEDBACK   │           │             │
├─────────────┤           ├─────────────┤           ├─────────────┤
│             │           │             │           │             │
│ What AI saw │           │ How it FELT │           │ Environment │
│ in photo:   │           │ to user:    │           │ factors:    │
│             │           │             │           │             │
│ "2% bar     │           │ "Too dark"  │           │ Room: dim   │
│  visible,   │           │ "Perfect"   │           │ Time: night │
│  blacks     │           │ "Weird      │           │ Distance:   │
│  lifted"    │           │  colors"    │           │   8 feet    │
│             │           │ "Go back"   │           │             │
└─────────────┘           └─────────────┘           └─────────────┘
    │                             │                             │
    └─────────────────────────────┼─────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │     LEARNING ENGINE     │
                    │                         │
                    │  Correlates patterns:   │
                    │  • Issue + Fix + Result │
                    │  • Environment impact   │
                    │  • Rollback patterns    │
                    │  • Success indicators   │
                    └────────────┬────────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────────────────┐
        │              LEARNED INSIGHTS                  │
        ├────────────────────────────────────────────────┤
        │                                                │
        │  MODEL-SPECIFIC LEARNINGS:                     │
        │  ┌────────────────────────────────────────┐   │
        │  │ Samsung UN55TU8000                     │   │
        │  │ • Default Brightness 50 → usually      │   │
        │  │   needs to go to 46-48                 │   │
        │  │ • Users in dim rooms prefer 47-48      │   │
        │  │ • Users in dark rooms prefer 45-46     │   │
        │  │ • If user says "too dark", also check  │   │
        │  │   Backlight (often set too low)        │   │
        │  └────────────────────────────────────────┘   │
        │                                                │
        │  CROSS-MODEL LEARNINGS:                        │
        │  ┌────────────────────────────────────────┐   │
        │  │ • "Too dark" + correct pattern =       │   │
        │  │   Backlight issue, not Brightness      │   │
        │  │ • Evening viewers prefer +2-3          │   │
        │  │   brightness vs pure calibration       │   │
        │  │ • 60% of rollbacks happen when AI      │   │
        │  │   suggests >5 point brightness drop    │   │
        │  └────────────────────────────────────────┘   │
        │                                                │
        └────────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────────────────┐
        │           NEXT USER BENEFITS                   │
        ├────────────────────────────────────────────────┤
        │                                                │
        │  Same TV + Similar Environment:                │
        │  "Based on 47 users with your TV in dim        │
        │   rooms, try Brightness 47 and Backlight 10.   │
        │   This worked for 89% of them."                │
        │                                                │
        │  Unknown TV + Known Environment:               │
        │  "I don't have data for your exact TV, but     │
        │   for similar Samsung models in dim rooms,     │
        │   Brightness around 45-48 usually works."      │
        │                                                │
        └────────────────────────────────────────────────┘
```

### Learning Data Structure

```typescript
interface LearnedSolution {
  id: string;

  // What this solution applies to
  tvModel: string;
  tvBrand: string;
  patternType: string;
  environmentType: 'bright' | 'dim' | 'dark' | 'any';

  // The issue and fix
  issueDetected: string;           // "blacks_lifted", "contrast_clipping", etc.
  settingChanges: Array<{
    setting: string;
    fromValue: string | number;    // Could be range: "48-52"
    toValue: string | number;      // Recommended value
    direction: 'increase' | 'decrease' | 'set';
  }>;

  // How we know this works
  statistics: {
    timesRecommended: number;
    timesApplied: number;          // User actually made the change
    timesSuccessful: number;       // User said it worked
    timesRolledBack: number;       // User undid it
    averageIterations: number;     // How many tries to get it right
    averageSatisfaction: number;   // 1-5 stars
  };

  // Computed confidence
  confidenceScore: number;         // 0-1, based on statistics

  // User feedback themes
  commonFeedback: {
    positive: string[];            // ["looks great", "perfect blacks"]
    negative: string[];            // ["too dark", "lost shadow detail"]
  };

  // When to suggest adjusting approach
  refinementTriggers: Array<{
    userSays: string;              // "too dark"
    thenTry: {
      setting: string;
      adjustment: string;          // "+2", "increase backlight instead"
    };
  }>;
}
```

---

## 4. Conversational AI Behavior

The AI should feel like a helpful expert friend, not a robot.

### Conversation Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AI PERSONALITY GUIDELINES                              │
└─────────────────────────────────────────────────────────────────────────────┘

1. EXPLAIN THE "WHY"
   ─────────────────
   ❌ "Set Brightness to 45"
   ✅ "Your blacks are being lifted to gray - that's why dark scenes
      look washed out. Lowering Brightness to 45 should fix that."

2. GIVE CONTEXT FOR SETTINGS
   ──────────────────────────
   ❌ "Adjust Brightness"
   ✅ "On your Samsung, Brightness controls black level (confusingly,
      Backlight controls overall brightness). Let's lower Brightness
      from 50 to 45."

3. ASK FOR SUBJECTIVE FEEDBACK
   ────────────────────────────
   ❌ "Pattern looks correct. Done."
   ✅ "The pattern looks correct now. But the important question:
      how does it look to YOUR eyes when watching real content?
      Try a dark scene - can you see the shadow details you want?"

4. ACKNOWLEDGE PREFERENCES MATTER
   ───────────────────────────────
   ❌ "This is the correct setting."
   ✅ "Technically 45 is 'correct,' but if it feels too dark for your
      room and viewing habits, we can find a middle ground at 47.
      Your enjoyment matters more than perfect calibration."

5. OFFER ESCAPE HATCHES
   ─────────────────────
   ✅ "If this doesn't feel right, we can always go back to where
      you started - I've saved your original settings."

6. LEARN OUT LOUD
   ───────────────
   ✅ "Interesting - you're the third person with this TV who found
      45 too dark. I'll remember that for future recommendations."
```

### Example Conversation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EXAMPLE CALIBRATION CONVERSATION                       │
└─────────────────────────────────────────────────────────────────────────────┘

AI: "I've analyzed the pattern photo. I can see your blacks are being
     'lifted' - they look dark gray instead of true black. This is why
     dark scenes in movies might look washed out.

     The fix is usually the Brightness setting (which on Samsung actually
     controls black level, not overall brightness - confusing, I know!).

     📍 On your Samsung UN55TU8000:
        Settings → Picture → Expert Settings → Brightness

     Try lowering it from 50 to around 45.

     Let me know when you've made the change!"

───────────────────────────────────────────────────────────────────────────────

USER: "Ok I set it to 45"

───────────────────────────────────────────────────────────────────────────────

AI: "Great! I've saved this as a checkpoint in case you want to go back.

     Now take another photo of the pattern so I can verify the change."

───────────────────────────────────────────────────────────────────────────────

USER: *takes photo*

───────────────────────────────────────────────────────────────────────────────

AI: "Looking at the pattern, your black levels are now correct - the
     test bars are exactly where they should be. ✓

     But here's the important part: how does it look to YOU?

     Try putting on something with dark scenes - a movie, a night scene
     in a show. Can you see the shadow details you want, or does it
     feel too dark overall?"

───────────────────────────────────────────────────────────────────────────────

USER: "It feels too dark honestly. Like I'm missing stuff in shadows"

───────────────────────────────────────────────────────────────────────────────

AI: "That's really helpful feedback. This is actually pretty common -
     technically 'correct' can feel too dark, especially in a dim room
     like yours.

     Let's try two things:

     1. Bump Brightness back up slightly to 47 (a compromise)

     2. What's your Backlight set to? This controls overall light output,
        and in a dim room you might need more than you think.

───────────────────────────────────────────────────────────────────────────────

USER: "Backlight is at 8"

───────────────────────────────────────────────────────────────────────────────

AI: "Ah, that's pretty low! For a dim room with evening viewing,
     I'd suggest:

     • Brightness: 47 (up from 45, down from original 50)
     • Backlight: 10-12 (up from 8)

     This keeps your blacks from being gray, but gives you enough
     overall light to see shadow details.

     Want to try that?"

───────────────────────────────────────────────────────────────────────────────

USER: "Set brightness to 47 and backlight to 11"

───────────────────────────────────────────────────────────────────────────────

AI: "Perfect, I've saved this as Checkpoint 2.

     Take one more photo of the pattern to verify, and then let me
     know how real content looks!"

───────────────────────────────────────────────────────────────────────────────

USER: *takes photo*

USER: "This looks way better! Dark scenes look good and I can see details"

───────────────────────────────────────────────────────────────────────────────

AI: "Excellent! Your final settings for black levels:

     ┌────────────────────────────────────────┐
     │  BEFORE          →    AFTER            │
     │  Brightness: 50       Brightness: 47   │
     │  Backlight: 8         Backlight: 11    │
     └────────────────────────────────────────┘

     I'm saving this to help other Samsung UN55TU8000 owners with
     similar rooms. You're helping the community! 🙏

     Want to move on to Contrast, or are you happy for now?"

───────────────────────────────────────────────────────────────────────────────

USER: "Let's do contrast too"

───────────────────────────────────────────────────────────────────────────────

AI: "Great! Let me show you the contrast test pattern.

     First, what's your current Contrast setting?
     (Same place: Settings → Picture → Expert Settings → Contrast)"

     [FLOW CONTINUES...]
```

---

## 5. Database Schema

```sql
-- ============================================
-- CROWDTUNER DATABASE SCHEMA v2.1
-- Conversational AI with Checkpoints + Learning
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
    settings_naming_quirks JSONB,  -- e.g., {"brightness": "controls black level, not brightness"}
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

    -- AI Research metadata
    research_confidence DECIMAL(3,2) DEFAULT 0.00,
    research_sources TEXT[],
    last_researched_at TIMESTAMPTZ,

    -- Usage stats
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

    -- What this setting actually does (for AI context)
    actual_function TEXT,          -- "Controls black level, not overall brightness"
    affects TEXT[],                -- ['black_level', 'shadow_detail']

    menu_path TEXT[],

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

    -- AI Analysis instructions
    analysis_prompt TEXT NOT NULL,

    -- What settings this pattern tests
    tests_settings TEXT[],         -- ['brightness', 'black_tone', 'shadow_detail']

    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CALIBRATION SESSIONS (A complete user journey)
-- ============================================
CREATE TABLE calibration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User (can be anonymous)
    user_id UUID,
    device_id VARCHAR(255),

    -- TV
    model_id UUID REFERENCES tv_models(id),
    model_number_entered VARCHAR(200),

    -- Environment context
    environment JSONB NOT NULL,
    /*
    {
        "room_lighting": "dim",
        "windows": "side",
        "viewing_time": "evening",
        "distance_feet": 8,
        "content_types": ["movies", "sports", "gaming"]
    }
    */

    -- Session mode
    mode VARCHAR(20),              -- 'quick_fix', 'full_calibration'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    -- Outcome
    final_satisfaction INTEGER CHECK (final_satisfaction BETWEEN 1 AND 5),
    final_feedback TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHECKPOINTS (Every saved state in a session)
-- ============================================
CREATE TABLE session_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES calibration_sessions(id) ON DELETE CASCADE,

    checkpoint_number INTEGER NOT NULL,
    label VARCHAR(200),            -- "Original", "Lowered Brightness", etc.

    -- Settings at this checkpoint
    settings JSONB NOT NULL,
    /*
    {
        "brightness": 50,
        "contrast": 45,
        "backlight": 8,
        ...
    }
    */

    -- Pattern capture (if applicable)
    pattern_id UUID REFERENCES patterns(id),
    capture_image_url TEXT,

    -- AI Analysis
    ai_analysis JSONB,
    /*
    {
        "pattern_result": "blacks_lifted",
        "recommendation": "Lower brightness to 45",
        "confidence": 0.85,
        "reasoning": "2% bar is visible when it should be invisible"
    }
    */

    -- User feedback at this checkpoint
    user_feedback JSONB,
    /*
    {
        "applied_recommendation": true,
        "subjective_response": "too dark",
        "wants_rollback": false,
        "notes": "Can't see shadow details"
    }
    */

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(session_id, checkpoint_number)
);

CREATE INDEX idx_checkpoints_session ON session_checkpoints(session_id);

-- ============================================
-- LEARNED SOLUTIONS (Crowd knowledge)
-- ============================================
CREATE TABLE learned_solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Applies to
    model_id UUID REFERENCES tv_models(id) ON DELETE CASCADE,
    pattern_id UUID REFERENCES patterns(id),
    environment_type VARCHAR(50),  -- 'bright', 'dim', 'dark', 'any'

    -- The issue and fix
    issue_type VARCHAR(100) NOT NULL,
    issue_description TEXT,

    setting_changes JSONB NOT NULL,
    /*
    [
        {
            "setting": "brightness",
            "from_range": "48-52",
            "to_value": 47,
            "direction": "decrease"
        },
        {
            "setting": "backlight",
            "from_range": "6-10",
            "to_value": 11,
            "direction": "increase"
        }
    ]
    */

    -- Statistics
    times_recommended INTEGER DEFAULT 0,
    times_applied INTEGER DEFAULT 0,
    times_successful INTEGER DEFAULT 0,
    times_rolled_back INTEGER DEFAULT 0,
    average_satisfaction DECIMAL(3,2),

    -- Computed confidence
    confidence_score DECIMAL(3,2) DEFAULT 0.50,

    -- Common feedback patterns
    positive_feedback TEXT[],
    negative_feedback TEXT[],

    -- Refinement triggers
    refinement_rules JSONB,
    /*
    [
        {
            "when_user_says": "too dark",
            "then_suggest": "increase backlight by 2-3",
            "times_used": 15,
            "success_rate": 0.87
        }
    ]
    */

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(model_id, pattern_id, environment_type, issue_type)
);

CREATE INDEX idx_solutions_lookup ON learned_solutions(model_id, pattern_id, environment_type);

-- ============================================
-- AI LEARNING LOG (Track what we learn from each session)
-- ============================================
CREATE TABLE learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES calibration_sessions(id) ON DELETE CASCADE,

    event_type VARCHAR(50) NOT NULL,
    /*
        'recommendation_accepted'
        'recommendation_rejected'
        'rollback_requested'
        'refinement_needed'
        'session_successful'
        'new_pattern_discovered'
    */

    context JSONB,
    /*
    {
        "tv_model": "Samsung UN55TU8000",
        "environment": "dim_room",
        "pattern": "black-level",
        "ai_said": "set brightness to 45",
        "user_said": "too dark",
        "user_settled_on": 47,
        "iterations_needed": 2
    }
    */

    insight_generated TEXT,        -- What we learned from this

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS (Optional accounts)
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
-- VIEWS
-- ============================================

-- Best solutions per model
CREATE VIEW v_effective_solutions AS
SELECT
    ls.*,
    tm.model_number,
    tm.display_name as tv_name,
    tb.name as brand_name,
    p.name as pattern_name,
    CASE
        WHEN times_applied > 0
        THEN (times_successful::float / times_applied)
        ELSE 0
    END as success_rate
FROM learned_solutions ls
JOIN tv_models tm ON ls.model_id = tm.id
JOIN tv_brands tb ON tm.brand_id = tb.id
LEFT JOIN patterns p ON ls.pattern_id = p.id
WHERE times_applied >= 5  -- Minimum data threshold
ORDER BY success_rate DESC, confidence_score DESC;

-- Session checkpoint timeline
CREATE VIEW v_session_timeline AS
SELECT
    cs.id as session_id,
    cs.mode,
    cs.environment,
    tm.display_name as tv,
    sc.checkpoint_number,
    sc.label,
    sc.settings,
    sc.ai_analysis,
    sc.user_feedback,
    sc.created_at
FROM calibration_sessions cs
JOIN tv_models tm ON cs.model_id = tm.id
JOIN session_checkpoints sc ON cs.id = sc.session_id
ORDER BY cs.id, sc.checkpoint_number;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update solution statistics after a session
CREATE OR REPLACE FUNCTION update_solution_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the relevant learned_solution based on session outcome
    -- This is called when a session is completed

    IF NEW.completed_at IS NOT NULL AND NEW.final_satisfaction IS NOT NULL THEN
        -- Find matching solution and update stats
        UPDATE learned_solutions
        SET
            times_applied = times_applied + 1,
            times_successful = times_successful + CASE WHEN NEW.final_satisfaction >= 4 THEN 1 ELSE 0 END,
            average_satisfaction = (
                (average_satisfaction * times_applied + NEW.final_satisfaction) / (times_applied + 1)
            ),
            confidence_score = (
                (times_successful + CASE WHEN NEW.final_satisfaction >= 4 THEN 1 ELSE 0 END)::float /
                (times_applied + 1)
            ),
            updated_at = NOW()
        WHERE model_id = NEW.model_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_solution_stats
AFTER UPDATE OF completed_at ON calibration_sessions
FOR EACH ROW
EXECUTE FUNCTION update_solution_stats();

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
    'Analyze this PLUGE pattern. Look for near-black bars at 2%, 4%, 6% gray against reference black.
     Correct: 2% invisible, 4% barely visible, 6% clearly visible.
     If 2% visible = brightness too high. If 4% invisible = brightness too low.'
),
(
    'White Clipping (Contrast)',
    'white-clipping',
    'c1',
    'contrast',
    'Tests if your Contrast setting is correct by showing near-white test bars.',
    ARRAY['contrast', 'dynamic_contrast', 'contrast_enhancer'],
    'Analyze this contrast pattern. Look for near-white bars at 95%, 97%, 99% against reference white.
     Correct: All bars distinguishable, 99% barely visible.
     If bars merged/invisible = contrast too high. If too distinct = contrast may be low.'
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
(
    'Samsung',
    ARRAY['SAMSUNG', 'samsung'],
    '{"brightness": "Controls black level, not overall brightness", "backlight": "Controls overall brightness"}'
),
(
    'LG',
    ARRAY['lg', 'L.G.'],
    '{"oled_light": "Overall brightness for OLED panels", "brightness": "Black level control"}'
),
(
    'Sony',
    ARRAY['SONY', 'sony', 'BRAVIA'],
    '{"brightness": "Standard black level control"}'
),
(
    'TCL',
    ARRAY['tcl'],
    '{}'
),
(
    'Hisense',
    ARRAY['HISENSE', 'hisense'],
    '{}'
),
(
    'Vizio',
    ARRAY['VIZIO', 'vizio'],
    '{}'
);
```

---

## 6. API / Edge Function Design

### 6.1 Core Endpoints

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API ENDPOINTS                                     │
└─────────────────────────────────────────────────────────────────────────────┘

POST /api/tv/identify
─────────────────────
Input:  { modelNumber: string } or { image: base64 } (for OCR)
Output: {
    model: TVModel,
    settings: TVSettingsMetadata[],
    existingSolutions: LearnedSolution[],
    confidence: number
}
Logic:  1. Check local DB
        2. If not found, AI research via Gemini
        3. Cache results
        4. Return with any existing crowd solutions

───────────────────────────────────────────────────────────────────────────────

POST /api/session/start
───────────────────────
Input:  {
    modelId: string,
    environment: Environment,
    mode: 'quick_fix' | 'full_calibration',
    initialSettings: Record<string, any>
}
Output: {
    sessionId: string,
    checkpoint0: Checkpoint,
    suggestedStartingPattern: string,
    relevantSolutions: LearnedSolution[]
}
Logic:  1. Create session
        2. Save Checkpoint 0 (baseline)
        3. Find any matching solutions for this TV + environment
        4. Suggest which pattern to start with

───────────────────────────────────────────────────────────────────────────────

POST /api/session/{id}/analyze
──────────────────────────────
Input:  {
    patternSlug: string,
    imageBase64: string,
    currentSettings: Record<string, any>
}
Output: {
    analysis: {
        patternResult: string,
        issuesFound: string[],
        confidence: number
    },
    recommendation: {
        setting: string,
        currentValue: any,
        suggestedValue: any,
        reasoning: string,
        menuPath: string[]
    },
    conversationalResponse: string  // The friendly AI message
}
Logic:  1. Send image + context to Gemini Vision
        2. Parse response
        3. Check for matching learned solutions
        4. Generate conversational response
        5. Return structured + conversational

───────────────────────────────────────────────────────────────────────────────

POST /api/session/{id}/checkpoint
─────────────────────────────────
Input:  {
    settings: Record<string, any>,
    label?: string,
    patternCapture?: { patternId: string, imageUrl: string },
    aiAnalysis?: AIAnalysis,
    userFeedback?: UserFeedback
}
Output: { checkpoint: Checkpoint }
Logic:  1. Save checkpoint with all context
        2. If feedback indicates rollback, note it
        3. If feedback indicates success, update solutions

───────────────────────────────────────────────────────────────────────────────

POST /api/session/{id}/rollback
───────────────────────────────
Input:  { toCheckpoint: number }
Output: {
    checkpoint: Checkpoint,
    message: string  // "Restored to Checkpoint 1: Brightness at 50"
}
Logic:  1. Fetch requested checkpoint
        2. Log rollback event for learning
        3. Return checkpoint data

───────────────────────────────────────────────────────────────────────────────

POST /api/session/{id}/complete
───────────────────────────────
Input:  {
    finalSettings: Record<string, any>,
    satisfaction: 1-5,
    feedback?: string
}
Output: {
    summary: SessionSummary,
    thanksMessage: string
}
Logic:  1. Save final state
        2. Calculate what changed from baseline
        3. Update learned solutions
        4. Log learning events
        5. Update model statistics

───────────────────────────────────────────────────────────────────────────────

GET /api/session/{id}/checkpoints
─────────────────────────────────
Output: { checkpoints: Checkpoint[] }
Logic:  Return full checkpoint timeline for session
```

### 6.2 Gemini Integration

```typescript
// Edge Function: analyze-pattern

interface AnalyzePatternRequest {
  sessionId: string;
  patternSlug: string;
  imageBase64: string;
  currentSettings: Record<string, any>;
}

interface AnalyzePatternResponse {
  analysis: {
    patternResult: 'correct' | 'issue_detected' | 'unclear';
    issuesFound: string[];
    observations: Array<{
      element: string;
      expected: string;
      actual: string;
      isIssue: boolean;
    }>;
    confidence: number;
  };
  recommendation: {
    setting: string;
    currentValue: any;
    suggestedValue: any;
    direction: 'increase' | 'decrease' | 'set';
    reasoning: string;
    menuPath: string[];
  } | null;
  conversationalResponse: string;
  shouldCaptureAgain: boolean;
}

async function analyzePattern(req: AnalyzePatternRequest): Promise<AnalyzePatternResponse> {
  // 1. Get session context
  const session = await getSession(req.sessionId);
  const tvModel = await getTVModel(session.model_id);
  const pattern = await getPattern(req.patternSlug);

  // 2. Check for existing solutions first
  const existingSolution = await findMatchingSolution(
    session.model_id,
    pattern.id,
    session.environment.room_lighting
  );

  // 3. Build Gemini prompt with full context
  const prompt = buildAnalysisPrompt({
    pattern,
    tvModel,
    environment: session.environment,
    currentSettings: req.currentSettings,
    existingSolution,
    sessionHistory: await getSessionCheckpoints(req.sessionId)
  });

  // 4. Call Gemini Vision
  const geminiResponse = await callGeminiVision(prompt, req.imageBase64);

  // 5. Parse and structure response
  const analysis = parseGeminiResponse(geminiResponse);

  // 6. Generate conversational response
  const conversationalResponse = generateConversationalResponse({
    analysis,
    tvModel,
    existingSolution,
    environment: session.environment
  });

  return {
    analysis: analysis.structured,
    recommendation: analysis.recommendation,
    conversationalResponse,
    shouldCaptureAgain: analysis.confidence < 0.7 || analysis.patternResult === 'unclear'
  };
}

function buildAnalysisPrompt(context: AnalysisContext): string {
  return `
You are CrowdTuner AI, helping a user calibrate their TV through conversation.

## TV INFORMATION
Model: ${context.tvModel.display_name}
Brand: ${context.tvModel.brand_name}
Panel: ${context.tvModel.panel_type}
Platform: ${context.tvModel.smart_platform}

## USER'S ENVIRONMENT
Room: ${context.environment.room_lighting}
Windows: ${context.environment.windows}
Viewing time: ${context.environment.viewing_time}
Distance: ${context.environment.distance_feet} feet

## CURRENT SETTINGS
${Object.entries(context.currentSettings).map(([k, v]) => `${k}: ${v}`).join('\n')}

## PATTERN BEING ANALYZED
${context.pattern.name}
${context.pattern.analysis_prompt}

## PREVIOUS ATTEMPTS THIS SESSION
${context.sessionHistory.map(cp =>
  `Checkpoint ${cp.checkpoint_number}: ${cp.label}
   Settings: ${JSON.stringify(cp.settings)}
   User said: ${cp.user_feedback?.subjective_response || 'N/A'}`
).join('\n\n')}

${context.existingSolution ? `
## COMMUNITY DATA
For similar users with this TV (${context.existingSolution.times_successful}/${context.existingSolution.times_applied} successful):
Recommended: ${JSON.stringify(context.existingSolution.setting_changes)}
Common feedback: ${context.existingSolution.positive_feedback?.join(', ')}
` : ''}

## YOUR TASK
1. Analyze the pattern image
2. Identify any calibration issues
3. Recommend a SPECIFIC adjustment considering:
   - The user's environment (${context.environment.room_lighting} room)
   - What they've already tried (avoid repeating failed approaches)
   - Community data if available
4. Explain in a friendly, conversational way

## OUTPUT FORMAT (JSON)
{
  "analysis": {
    "patternResult": "correct" | "issue_detected" | "unclear",
    "issuesFound": ["list of specific issues"],
    "observations": [
      {"element": "2% bar", "expected": "invisible", "actual": "visible", "isIssue": true}
    ],
    "confidence": 0.0-1.0
  },
  "recommendation": {
    "setting": "exact setting name",
    "currentValue": current_value,
    "suggestedValue": suggested_value,
    "direction": "increase" | "decrease" | "set",
    "reasoning": "why this will help",
    "menuPath": ["Settings", "Picture", "..."]
  },
  "conversationalResponse": "Friendly message to user explaining what you see and what to try",
  "askUserAbout": "optional question to ask user for more info"
}
`;
}
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Sprint 1-2)

```
CORE SETUP
├── Expo + TypeScript project
├── react-native-vision-camera setup
├── Supabase project + schema deployment
├── Basic navigation structure
└── Environment configuration

TV IDENTIFICATION
├── ML Kit OCR for label scanning
├── Manual model entry + search
├── AI research pipeline (Gemini)
└── Settings metadata caching

FIRST PATTERN FLOW (Black Level only)
├── Pattern display (website + QR)
├── Basic capture screen
├── Gemini Vision integration
├── Simple results display
└── Manual settings entry
```

### Phase 2: Conversation Loop (Sprint 3-4)

```
CHECKPOINT SYSTEM
├── Checkpoint creation/storage
├── Checkpoint restoration (rollback)
├── Timeline visualization
└── "Go back to..." UI

ITERATIVE REFINEMENT
├── Capture → Analyze → Adjust loop
├── User feedback collection
├── AI response to feedback
├── Multi-iteration tracking
└── Session completion flow

ENVIRONMENT AWARENESS
├── Environment questionnaire
├── Environment-based recommendations
├── Contextual AI prompts
└── Room-specific solutions
```

### Phase 3: Learning System (Sprint 5-6)

```
CROWD LEARNING
├── Solution storage from successful sessions
├── Solution matching for new users
├── Confidence scoring
├── Feedback pattern detection
└── Refinement trigger rules

AI IMPROVEMENT
├── Learning event logging
├── Solution statistics updates
├── Cross-session pattern detection
├── Model-specific insights
└── Environment correlation analysis

ADDITIONAL PATTERNS
├── Contrast pattern flow
├── Color bars pattern flow
├── Grayscale pattern flow
├── Sharpness pattern flow
└── Full calibration mode
```

### Phase 4: Polish & Launch (Sprint 7-8)

```
USER EXPERIENCE
├── Onboarding flow
├── Progress indicators
├── Error handling + recovery
├── Session resume
└── Settings history

CONTENT
├── Pattern videos (YouTube)
├── Pattern website pages
├── Tutorial content
└── Help documentation

LAUNCH PREP
├── Beta testing
├── Play Store assets
├── Landing page
└── Analytics integration
```

---

## 8. Success Metrics

### MVP Launch Criteria
- [ ] User can identify any TV (OCR or manual)
- [ ] AI can research settings for unknown TVs
- [ ] Full black level calibration flow works end-to-end
- [ ] Checkpoints save and restore correctly
- [ ] User feedback influences AI responses
- [ ] Successful sessions save to solutions database

### Growth Metrics
- Sessions completed per week
- Average satisfaction score (target: 4+)
- Solution reuse rate (crowd data being used)
- Average iterations to success (target: <3)
- Rollback rate (lower = better recommendations)

---

*Document Version: 2.1*
*Status: Ready for Implementation*
