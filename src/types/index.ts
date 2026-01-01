// ============================================
// CROWDTUNER TYPE DEFINITIONS
// ============================================

// ============================================
// TV MODELS
// ============================================

export interface TVBrand {
  id: string;
  name: string;
  aliases: string[];
  defaultMenuPath?: string[];
  settingsNamingQuirks?: Record<string, string>;
}

export interface TVModel {
  id: string;
  brandId: string;
  brandName?: string;
  modelNumber: string;
  modelAliases: string[];
  displayName: string;
  year?: number;
  panelType?: 'OLED' | 'QLED' | 'LED' | 'Mini-LED' | 'LCD' | 'Plasma';
  resolution?: string;
  smartPlatform?: string;
  researchConfidence: number;
  researchSources?: string[];
}

export interface TVSettingMetadata {
  id: string;
  modelId: string;
  settingName: string;
  settingCategory: 'basic' | 'advanced' | 'expert';
  settingType: 'slider' | 'dropdown' | 'toggle';
  rangeMin?: number;
  rangeMax?: number;
  dropdownOptions?: string[];
  defaultValue?: string | number;
  recommendedBrightRoom?: string | number;
  recommendedDimRoom?: string | number;
  recommendedDarkRoom?: string | number;
  menuPath?: string[];
  actualFunction?: string;
  affects?: string[];
  confidence: number;
}

// ============================================
// ENVIRONMENT
// ============================================

export type RoomLighting = 'bright' | 'dim' | 'dark';
export type WindowPosition = 'behind_tv' | 'side' | 'behind_viewer' | 'none';
export type ViewingTime = 'day' | 'evening' | 'mixed';

export interface Environment {
  roomLighting: RoomLighting;
  windows: WindowPosition;
  viewingTime: ViewingTime;
  distanceFeet: number;
  contentTypes?: string[];
}

// ============================================
// CALIBRATION PATTERNS
// ============================================

export interface Pattern {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  shortCode: string;
  testsSettings: string[];
  displayOrder: number;
}

// ============================================
// SESSION & CHECKPOINTS
// ============================================

export type SessionMode = 'quick_fix' | 'full_calibration';

export interface CalibrationSession {
  id: string;
  userId?: string;
  deviceId?: string;
  modelId: string;
  modelNumberEntered: string;
  environment: Environment;
  mode: SessionMode;
  startedAt: Date;
  completedAt?: Date;
  finalSatisfaction?: 1 | 2 | 3 | 4 | 5;
  finalFeedback?: string;
}

export interface Settings {
  brightness?: number;
  contrast?: number;
  backlight?: number;
  color?: number;
  tint?: number | string;
  sharpness?: number;
  [key: string]: number | string | undefined;
}

export interface PatternCapture {
  patternId: string;
  imageUrl: string;
}

export interface AIAnalysis {
  patternResult: 'correct' | 'issue_detected' | 'unclear';
  issuesFound: string[];
  observations: Array<{
    element: string;
    expected: string;
    actual: string;
    isIssue: boolean;
  }>;
  recommendation?: {
    setting: string;
    currentValue: string | number;
    suggestedValue: string | number;
    direction: 'increase' | 'decrease' | 'set';
    reasoning: string;
    menuPath: string[];
  };
  confidence: number;
  conversationalResponse: string;
}

export interface UserFeedback {
  appliedRecommendation: boolean;
  subjectiveResponse?: string;
  wantsRollback: boolean;
  notes?: string;
}

export interface Checkpoint {
  id: string;
  sessionId: string;
  checkpointNumber: number;
  label: string;
  settings: Settings;
  patternCapture?: PatternCapture;
  aiAnalysis?: AIAnalysis;
  userFeedback?: UserFeedback;
  createdAt: Date;
}

// ============================================
// LEARNED SOLUTIONS
// ============================================

export interface SettingChange {
  setting: string;
  fromRange?: string;
  toValue: string | number;
  direction: 'increase' | 'decrease' | 'set';
}

export interface RefinementRule {
  whenUserSays: string;
  thenSuggest: string;
  timesUsed: number;
  successRate: number;
}

export interface LearnedSolution {
  id: string;
  modelId: string;
  patternId?: string;
  environmentType: 'bright' | 'dim' | 'dark' | 'any';
  issueType: string;
  issueDescription?: string;
  settingChanges: SettingChange[];
  timesRecommended: number;
  timesApplied: number;
  timesSuccessful: number;
  timesRolledBack: number;
  averageSatisfaction?: number;
  confidenceScore: number;
  positiveFeedback?: string[];
  negativeFeedback?: string[];
  refinementRules?: RefinementRule[];
}

// ============================================
// API RESPONSES
// ============================================

export interface IdentifyTVResponse {
  model: TVModel;
  settings: TVSettingMetadata[];
  existingSolutions: LearnedSolution[];
  confidence: number;
  isNewModel: boolean;
}

export interface StartSessionResponse {
  sessionId: string;
  checkpoint0: Checkpoint;
  suggestedStartingPattern: string;
  relevantSolutions: LearnedSolution[];
}

export interface AnalyzePatternResponse {
  analysis: AIAnalysis;
  conversationalResponse: string;
  shouldCaptureAgain: boolean;
  existingSolution?: LearnedSolution;
}

// ============================================
// APP STATE
// ============================================

export interface AppState {
  // Current session
  session: CalibrationSession | null;
  checkpoints: Checkpoint[];
  currentCheckpointIndex: number;

  // TV info
  tvModel: TVModel | null;
  tvSettings: TVSettingMetadata[];
  currentSettings: Settings;

  // Environment
  environment: Environment | null;

  // UI state
  isLoading: boolean;
  error: string | null;
}
