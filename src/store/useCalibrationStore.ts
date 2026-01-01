import { create } from 'zustand';
import type {
  CalibrationSession,
  Checkpoint,
  TVModel,
  TVSettingMetadata,
  Settings,
  Environment,
  SessionMode,
  AIAnalysis,
  UserFeedback,
  LearnedSolution,
} from '../types';

interface CalibrationStore {
  // Session state
  session: CalibrationSession | null;
  checkpoints: Checkpoint[];
  currentCheckpointIndex: number;

  // TV info
  tvModel: TVModel | null;
  tvSettings: TVSettingMetadata[];
  currentSettings: Settings;

  // Environment
  environment: Environment | null;

  // Solutions
  relevantSolutions: LearnedSolution[];

  // UI state
  isLoading: boolean;
  error: string | null;
  currentPatternSlug: string | null;

  // Actions - Session
  startSession: (params: {
    tvModel: TVModel;
    tvSettings: TVSettingMetadata[];
    environment: Environment;
    mode: SessionMode;
    initialSettings: Settings;
  }) => void;

  setSessionId: (sessionId: string) => void;

  completeSession: (satisfaction: 1 | 2 | 3 | 4 | 5, feedback?: string) => void;

  // Actions - Checkpoints
  createCheckpoint: (params: {
    label: string;
    settings: Settings;
    patternCapture?: { patternId: string; imageUrl: string };
    aiAnalysis?: AIAnalysis;
  }) => Checkpoint;

  updateCheckpointFeedback: (checkpointId: string, feedback: UserFeedback) => void;

  rollbackToCheckpoint: (checkpointNumber: number) => Settings;

  // Actions - Settings
  updateCurrentSettings: (settings: Partial<Settings>) => void;

  // Actions - TV
  setTVModel: (model: TVModel, settings: TVSettingMetadata[]) => void;

  // Actions - Environment
  setEnvironment: (environment: Environment) => void;

  // Actions - Pattern
  setCurrentPattern: (patternSlug: string | null) => void;

  // Actions - Solutions
  setRelevantSolutions: (solutions: LearnedSolution[]) => void;

  // Actions - UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - Reset
  resetSession: () => void;
}

const initialState = {
  session: null,
  checkpoints: [],
  currentCheckpointIndex: -1,
  tvModel: null,
  tvSettings: [],
  currentSettings: {},
  environment: null,
  relevantSolutions: [],
  isLoading: false,
  error: null,
  currentPatternSlug: null,
};

export const useCalibrationStore = create<CalibrationStore>((set, get) => ({
  ...initialState,

  // Start a new calibration session
  startSession: ({ tvModel, tvSettings, environment, mode, initialSettings }) => {
    const session: CalibrationSession = {
      id: '', // Will be set when saved to DB
      modelId: tvModel.id,
      modelNumberEntered: tvModel.modelNumber,
      environment,
      mode,
      startedAt: new Date(),
    };

    // Create checkpoint 0 (baseline)
    const checkpoint0: Checkpoint = {
      id: `local_${Date.now()}`,
      sessionId: session.id,
      checkpointNumber: 0,
      label: 'Original Settings',
      settings: initialSettings,
      createdAt: new Date(),
    };

    set({
      session,
      tvModel,
      tvSettings,
      environment,
      currentSettings: initialSettings,
      checkpoints: [checkpoint0],
      currentCheckpointIndex: 0,
      error: null,
    });
  },

  setSessionId: (sessionId: string) => {
    set((state) => ({
      session: state.session ? { ...state.session, id: sessionId } : null,
      checkpoints: state.checkpoints.map((cp) => ({ ...cp, sessionId })),
    }));
  },

  completeSession: (satisfaction, feedback) => {
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            completedAt: new Date(),
            finalSatisfaction: satisfaction,
            finalFeedback: feedback,
          }
        : null,
    }));
  },

  // Create a new checkpoint with current state
  createCheckpoint: ({ label, settings, patternCapture, aiAnalysis }) => {
    const state = get();
    const newCheckpointNumber = state.checkpoints.length;

    const checkpoint: Checkpoint = {
      id: `local_${Date.now()}`,
      sessionId: state.session?.id || '',
      checkpointNumber: newCheckpointNumber,
      label,
      settings,
      patternCapture,
      aiAnalysis,
      createdAt: new Date(),
    };

    set({
      checkpoints: [...state.checkpoints, checkpoint],
      currentCheckpointIndex: newCheckpointNumber,
      currentSettings: settings,
    });

    return checkpoint;
  },

  updateCheckpointFeedback: (checkpointId, feedback) => {
    set((state) => ({
      checkpoints: state.checkpoints.map((cp) =>
        cp.id === checkpointId ? { ...cp, userFeedback: feedback } : cp
      ),
    }));
  },

  rollbackToCheckpoint: (checkpointNumber) => {
    const state = get();
    const checkpoint = state.checkpoints.find(
      (cp) => cp.checkpointNumber === checkpointNumber
    );

    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointNumber} not found`);
    }

    set({
      currentCheckpointIndex: checkpointNumber,
      currentSettings: checkpoint.settings,
    });

    return checkpoint.settings;
  },

  updateCurrentSettings: (settings) => {
    set((state) => ({
      currentSettings: { ...state.currentSettings, ...settings },
    }));
  },

  setTVModel: (model, settings) => {
    set({ tvModel: model, tvSettings: settings });
  },

  setEnvironment: (environment) => {
    set({ environment });
  },

  setCurrentPattern: (patternSlug) => {
    set({ currentPatternSlug: patternSlug });
  },

  setRelevantSolutions: (solutions) => {
    set({ relevantSolutions: solutions });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  resetSession: () => {
    set(initialState);
  },
}));

// Selectors
export const selectCurrentCheckpoint = (state: CalibrationStore): Checkpoint | null => {
  if (state.currentCheckpointIndex < 0) return null;
  return state.checkpoints[state.currentCheckpointIndex] || null;
};

export const selectCanRollback = (state: CalibrationStore): boolean => {
  return state.checkpoints.length > 1;
};

export const selectCheckpointLabels = (state: CalibrationStore): string[] => {
  return state.checkpoints.map((cp) => cp.label);
};
