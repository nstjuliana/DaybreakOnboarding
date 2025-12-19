/**
 * @file Onboarding Store
 * @description React Context-based state management for the onboarding flow.
 *              Tracks current phase, user selections, and assessment data.
 *
 * @see {@link _docs/user-flow.md} for flow documentation
 */

'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { PhaseId } from '@/lib/constants/phases';
import { UserType } from '@/types/user';
import {
  saveToStorage,
  loadFromStorage,
  clearOnboardingStorage,
} from '@/lib/utils/storage';

/**
 * Storage key for persisting onboarding state
 */
const STORAGE_KEY = 'state';

/**
 * Assessment responses type
 */
export type AssessmentResponses = Record<string, number>;

/**
 * Screener type options
 */
export type ScreenerType = 'psc17' | 'phq9a' | 'scared';

/**
 * Insurance status options
 */
export type InsuranceStatus = 'insured' | 'self_pay' | 'uninsured' | null;

/**
 * Onboarding state shape
 */
export interface OnboardingState {
  /** Current phase in the flow */
  currentPhase: PhaseId;
  /** Completed phases */
  completedPhases: PhaseId[];
  /** Selected user type from Phase 0 */
  userType: UserType | null;
  /** Selected concern areas from Phase 1.5 */
  concernAreas: string[];
  /** Assessment responses from Phase 2 */
  assessmentResponses: AssessmentResponses;
  /** Assessment ID after creation */
  assessmentId: string | null;
  /** Matched clinician ID */
  clinicianId: string | null;
  /** Whether there's saved progress to resume */
  hasSavedProgress: boolean;
  /** Timestamp of last save */
  lastSavedAt: string | null;
  /** Conversation ID for AI chat mode */
  conversationId: string | null;
  /** Selected screener type based on triage */
  screenerType: ScreenerType;
  /** User preference for chat vs static form */
  preferChatMode: boolean;
  /** Insurance status for clinician matching */
  insuranceStatus: InsuranceStatus;
  /** Specific insurance provider if insured */
  insuranceProvider: string | null;
}

/**
 * Initial state
 */
const initialState: OnboardingState = {
  currentPhase: 'phase-0',
  completedPhases: [],
  userType: null,
  concernAreas: [],
  assessmentResponses: {},
  assessmentId: null,
  clinicianId: null,
  hasSavedProgress: false,
  lastSavedAt: null,
  conversationId: null,
  screenerType: 'psc17',
  preferChatMode: true,
  insuranceStatus: null,
  insuranceProvider: null,
};

/**
 * Action types
 */
type OnboardingAction =
  | { type: 'SET_PHASE'; payload: PhaseId }
  | { type: 'COMPLETE_PHASE'; payload: PhaseId }
  | { type: 'SET_USER_TYPE'; payload: UserType }
  | { type: 'SET_CONCERN_AREAS'; payload: string[] }
  | { type: 'SET_ASSESSMENT_RESPONSES'; payload: AssessmentResponses }
  | { type: 'UPDATE_ASSESSMENT_RESPONSE'; payload: { questionId: string; value: number } }
  | { type: 'SET_ASSESSMENT_ID'; payload: string }
  | { type: 'SET_CLINICIAN_ID'; payload: string }
  | { type: 'LOAD_SAVED_STATE'; payload: OnboardingState }
  | { type: 'MARK_SAVED'; payload: string }
  | { type: 'SET_CONVERSATION_ID'; payload: string }
  | { type: 'SET_SCREENER_TYPE'; payload: ScreenerType }
  | { type: 'SET_PREFER_CHAT_MODE'; payload: boolean }
  | { type: 'SET_INSURANCE_STATUS'; payload: InsuranceStatus }
  | { type: 'SET_INSURANCE_PROVIDER'; payload: string | null }
  | { type: 'RESET' };

/**
 * Reducer function
 */
function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, currentPhase: action.payload };

    case 'COMPLETE_PHASE':
      if (state.completedPhases.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        completedPhases: [...state.completedPhases, action.payload],
      };

    case 'SET_USER_TYPE':
      return { ...state, userType: action.payload };

    case 'SET_CONCERN_AREAS':
      return { ...state, concernAreas: action.payload };

    case 'SET_ASSESSMENT_RESPONSES':
      return { ...state, assessmentResponses: action.payload };

    case 'UPDATE_ASSESSMENT_RESPONSE':
      return {
        ...state,
        assessmentResponses: {
          ...state.assessmentResponses,
          [action.payload.questionId]: action.payload.value,
        },
      };

    case 'SET_ASSESSMENT_ID':
      return { ...state, assessmentId: action.payload };

    case 'SET_CLINICIAN_ID':
      return { ...state, clinicianId: action.payload };

    case 'SET_CONVERSATION_ID':
      return { ...state, conversationId: action.payload };

    case 'SET_SCREENER_TYPE':
      return { ...state, screenerType: action.payload };

    case 'SET_PREFER_CHAT_MODE':
      return { ...state, preferChatMode: action.payload };

    case 'SET_INSURANCE_STATUS':
      return { ...state, insuranceStatus: action.payload };

    case 'SET_INSURANCE_PROVIDER':
      return { ...state, insuranceProvider: action.payload };

    case 'LOAD_SAVED_STATE':
      return { ...action.payload, hasSavedProgress: true };

    case 'MARK_SAVED':
      return {
        ...state,
        hasSavedProgress: true,
        lastSavedAt: action.payload,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/**
 * Context type with state and actions
 */
interface OnboardingContextValue {
  state: OnboardingState;
  setPhase: (phase: PhaseId) => void;
  completePhase: (phase: PhaseId) => void;
  setUserType: (type: UserType) => void;
  setConcernAreas: (areas: string[]) => void;
  setAssessmentResponses: (responses: AssessmentResponses) => void;
  updateAssessmentResponse: (questionId: string, value: number) => void;
  setAssessmentId: (id: string) => void;
  setClinicianId: (id: string) => void;
  setConversationId: (id: string) => void;
  setScreenerType: (type: ScreenerType) => void;
  setPreferChatMode: (prefer: boolean) => void;
  setInsuranceStatus: (status: InsuranceStatus) => void;
  setInsuranceProvider: (provider: string | null) => void;
  saveProgress: () => void;
  loadSavedProgress: () => boolean;
  clearProgress: () => void;
  reset: () => void;
}

/**
 * Context instance
 */
const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/**
 * Provider props
 */
interface OnboardingProviderProps {
  children: ReactNode;
}

/**
 * Onboarding state provider component
 *
 * @example
 * ```tsx
 * <OnboardingProvider>
 *   <App />
 * </OnboardingProvider>
 * ```
 */
export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  // Check for saved progress on mount
  useEffect(() => {
    const savedState = loadFromStorage<OnboardingState>(STORAGE_KEY);
    if (savedState) {
      dispatch({ type: 'LOAD_SAVED_STATE', payload: savedState });
    }
  }, []);

  const setPhase = useCallback((phase: PhaseId) => {
    dispatch({ type: 'SET_PHASE', payload: phase });
  }, []);

  const completePhase = useCallback((phase: PhaseId) => {
    dispatch({ type: 'COMPLETE_PHASE', payload: phase });
  }, []);

  const setUserType = useCallback((type: UserType) => {
    dispatch({ type: 'SET_USER_TYPE', payload: type });
  }, []);

  const setConcernAreas = useCallback((areas: string[]) => {
    dispatch({ type: 'SET_CONCERN_AREAS', payload: areas });
  }, []);

  const setAssessmentResponses = useCallback((responses: AssessmentResponses) => {
    dispatch({ type: 'SET_ASSESSMENT_RESPONSES', payload: responses });
  }, []);

  const updateAssessmentResponse = useCallback(
    (questionId: string, value: number) => {
      dispatch({
        type: 'UPDATE_ASSESSMENT_RESPONSE',
        payload: { questionId, value },
      });
    },
    []
  );

  const setAssessmentId = useCallback((id: string) => {
    dispatch({ type: 'SET_ASSESSMENT_ID', payload: id });
  }, []);

  const setClinicianId = useCallback((id: string) => {
    dispatch({ type: 'SET_CLINICIAN_ID', payload: id });
  }, []);

  const setConversationId = useCallback((id: string) => {
    dispatch({ type: 'SET_CONVERSATION_ID', payload: id });
  }, []);

  const setScreenerType = useCallback((type: ScreenerType) => {
    dispatch({ type: 'SET_SCREENER_TYPE', payload: type });
  }, []);

  const setPreferChatMode = useCallback((prefer: boolean) => {
    dispatch({ type: 'SET_PREFER_CHAT_MODE', payload: prefer });
  }, []);

  const setInsuranceStatus = useCallback((status: InsuranceStatus) => {
    dispatch({ type: 'SET_INSURANCE_STATUS', payload: status });
  }, []);

  const setInsuranceProvider = useCallback((provider: string | null) => {
    dispatch({ type: 'SET_INSURANCE_PROVIDER', payload: provider });
  }, []);

  const saveProgress = useCallback(() => {
    const timestamp = new Date().toISOString();
    saveToStorage(STORAGE_KEY, { ...state, lastSavedAt: timestamp });
    dispatch({ type: 'MARK_SAVED', payload: timestamp });
  }, [state]);

  const loadSavedProgress = useCallback((): boolean => {
    const savedState = loadFromStorage<OnboardingState>(STORAGE_KEY);
    if (savedState) {
      dispatch({ type: 'LOAD_SAVED_STATE', payload: savedState });
      return true;
    }
    return false;
  }, []);

  const clearProgress = useCallback(() => {
    clearOnboardingStorage();
    dispatch({ type: 'RESET' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: OnboardingContextValue = {
    state,
    setPhase,
    completePhase,
    setUserType,
    setConcernAreas,
    setAssessmentResponses,
    updateAssessmentResponse,
    setAssessmentId,
    setClinicianId,
    setConversationId,
    setScreenerType,
    setPreferChatMode,
    setInsuranceStatus,
    setInsuranceProvider,
    saveProgress,
    loadSavedProgress,
    clearProgress,
    reset,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

/**
 * Hook to access onboarding state and actions
 *
 * @returns Onboarding context value
 * @throws Error if used outside OnboardingProvider
 *
 * @example
 * ```tsx
 * function PhaseComponent() {
 *   const { state, setPhase, completePhase } = useOnboarding();
 *
 *   const handleContinue = () => {
 *     completePhase(state.currentPhase);
 *     setPhase('phase-2');
 *   };
 * }
 * ```
 */
export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

