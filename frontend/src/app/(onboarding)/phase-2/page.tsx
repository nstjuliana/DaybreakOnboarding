/**
 * @file Phase 2 Page
 * @description AI-powered screener assessment with chat interface.
 *              Includes fallback to static form based on user preference.
 *
 * @see {@link _docs/user-flow.md} Phase 2: Holistic Intake
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding, type ScreenerType } from '@/stores/onboarding-store';
import { ScreenerForm } from '@/components/forms/screener-form';
import { ChatContainer } from '@/components/chat/chat-container';
import { SafetyPivot } from '@/components/onboarding/safety-pivot';
import { useChat } from '@/hooks/use-chat';
import type { Responses } from '@/lib/utils/score-calculator';
import type { QuickReplyOption } from '@/components/chat/quick-replies';
import { cn } from '@/lib/utils';
import { PSC17_RESPONSE_OPTIONS } from '@/lib/constants/screeners/psc-17';
import { SCARED_RESPONSE_OPTIONS } from '@/lib/constants/screeners/scared';
import { PHQ9A_RESPONSE_OPTIONS } from '@/lib/constants/screeners/phq9a';

/**
 * Gets response options for a screener type
 */
function getResponseOptionsForScreener(screenerType: ScreenerType) {
  switch (screenerType) {
    case 'phq9a':
      return PHQ9A_RESPONSE_OPTIONS;
    case 'scared':
      return SCARED_RESPONSE_OPTIONS;
    case 'psc17':
    default:
      return PSC17_RESPONSE_OPTIONS;
  }
}

/**
 * Assessment mode options
 */
type AssessmentMode = 'chat' | 'form';

/**
 * Phase 2: Screener page
 * Supports both AI chat and static form modes
 */
export default function Phase2Page() {
  const router = useRouter();
  const {
    state,
    setPhase,
    completePhase,
    setAssessmentResponses,
    saveProgress,
    setPreferChatMode,
  } = useOnboarding();

  const [mode, setMode] = useState<AssessmentMode>(
    state.preferChatMode ? 'chat' : 'form'
  );
  const [showSafetyPivot, setShowSafetyPivot] = useState(false);
  const [riskLevel] = useState<'high' | 'critical'>('high');
  const greetingInitializedRef = useRef(false);

  // Chat hook for AI mode - uses same screener type as form
  const {
    messages,
    isTyping,
    isSending,
    quickReplies,
    currentQuestionIndex,
    totalQuestions,
    isScreenerComplete,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    screenerResponses: _screenerResponses,
    sendMessage,
    sendQuickReply,
    addMessage,
    setQuickReplies,
  } = useChat({
    conversationId: state.conversationId || undefined,
    screenerType: state.screenerType, // Use the same screener type as the standard form
    onAIResponse: () => {
      // Check for crisis in AI response metadata
      // This would be passed from backend
    },
    onScreenerComplete: (responses) => {
      // Convert screener responses to assessment format and save
      setAssessmentResponses(responses);
      console.log('Screener completed:', responses);
    },
  });

  // Set current phase and redirect if prerequisites not met
  useEffect(() => {
    setPhase('phase-2');

    // Redirect if no user type selected
    if (!state.userType) {
      router.push('/phase-0');
    }
  }, [setPhase, state.userType, router]);

  /**
   * Handles static form save progress
   */
  const handleFormSaveProgress = useCallback(
    (responses: Responses) => {
      setAssessmentResponses(responses);
      setTimeout(() => saveProgress(), 0);
    },
    [setAssessmentResponses, saveProgress]
  );

  /**
   * Gets greeting message based on context
   */
  const getGreetingMessage = useCallback((): string => {
    const isMinor = state.userType === 'minor';
    return `Hi there! 👋 I'm here to guide you through a quick wellness check. This will help us understand how we can best support ${isMinor ? 'you' : 'your child'}.\n\nI'll ask you some questions, and you can answer however feels most natural. There are no right or wrong answers.\n\nReady to begin?`;
  }, [state.userType]);

  /**
   * Gets initial quick replies based on screener type
   */
  const getInitialQuickReplies = useCallback((): QuickReplyOption[] => {
    return [
      { value: 1, label: "Yes, I'm ready to start" },
      { value: 0, label: 'Tell me more about this first' },
    ];
  }, []);

  /**
   * Gets context-aware quick replies based on the current question state and screener type
   */
  const getContextQuickReplies = useCallback((): QuickReplyOption[] => {
    // If screener is complete, no quick replies
    if (isScreenerComplete) {
      return [];
    }
    
    // If in intro state (not started), show start options
    if (currentQuestionIndex < 0) {
      return [
        { value: 1, label: "Yes, I'm ready to start" },
        { value: 0, label: 'Tell me more about this first' },
      ];
    }
    
    // During questions, show dynamic answer options based on screener type
    const options = getResponseOptionsForScreener(state.screenerType);
    return options.map(opt => ({
      value: opt.value,
      label: opt.label.split(' ')[0], // Use first word for cleaner buttons (e.g., "Never" instead of "Never - Not true")
    }));
  }, [currentQuestionIndex, isScreenerComplete, state.screenerType]);

  // Initialize chat with greeting (only once)
  useEffect(() => {
    if (mode === 'chat' && messages.length === 0 && !greetingInitializedRef.current) {
      greetingInitializedRef.current = true;
      
      // Add initial AI greeting
      addMessage({
        id: `greeting-${Date.now()}`,
        sender: 'ai',
        content: getGreetingMessage(),
        timestamp: new Date(),
      });

      // Set initial quick replies based on screener type
      setQuickReplies(getInitialQuickReplies());
    }
  }, [mode, messages.length, addMessage, setQuickReplies, getGreetingMessage, getInitialQuickReplies]);
  
  // Update quick replies when question index changes
  useEffect(() => {
    if (mode === 'chat' && !isTyping && !isSending) {
      setQuickReplies(getContextQuickReplies());
    }
  }, [mode, currentQuestionIndex, isScreenerComplete, isTyping, isSending, setQuickReplies, getContextQuickReplies]);

  // Don't render until we have user type
  if (!state.userType) {
    return null;
  }

  /**
   * Handles mode toggle
   */
  function handleModeToggle(newMode: AssessmentMode) {
    setMode(newMode);
    setPreferChatMode(newMode === 'chat');
  }

  /**
   * Handles chat message send
   */
  async function handleSendMessage(content: string) {
    await sendMessage(content);
  }

  /**
   * Handles quick reply selection
   */
  async function handleQuickReply(option: QuickReplyOption) {
    await sendQuickReply(option);
  }
  
  /**
   * Handles continuing after chat assessment completes
   */
  function handleChatComplete() {
    completePhase('phase-2');
    setPhase('phase-3');
    router.push('/phase-3/account');
  }

  /**
   * Handles safety pivot confirmation
   */
  function handleSafetyConfirm() {
    setShowSafetyPivot(false);
    // Resume conversation or allow form completion
  }

  /**
   * Handles static form submission
   */
  async function handleFormSubmit(
    responses: Responses,
    score: number,
    severity: string
  ) {
    setAssessmentResponses(responses);
    console.log('Assessment submitted:', { responses, score, severity });

    completePhase('phase-2');
    setPhase('phase-3');
    router.push('/phase-3/account');
  }

  /**
   * Handles back navigation
   */
  function handleBack() {
    router.push('/phase-1-5');
  }

  // Show safety pivot if triggered
  if (showSafetyPivot) {
    return (
      <SafetyPivot
        riskLevel={riskLevel}
        onConfirmSafe={handleSafetyConfirm}
        onExit={() => router.push('/')}
      />
    );
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Quick Assessment
        </h1>
        <p className="text-muted-foreground">
          These questions help us understand how we can best support{' '}
          {state.userType === 'minor' ? 'you' : 'your child'}.
        </p>
      </div>

      {/* Mode toggle */}
      <ModeToggle mode={mode} onModeChange={handleModeToggle} />

      {/* Assessment content */}
      <div className="w-full max-w-2xl mt-6">
        {mode === 'chat' ? (
          <>
            {/* Progress indicator for chat mode */}
            {currentQuestionIndex >= 0 && !isScreenerComplete && (
              <div className="mb-4">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </p>
              </div>
            )}
            
            <ChatContainer
              messages={messages}
              isTyping={isTyping}
              isSending={isSending}
              onSendMessage={handleSendMessage}
              quickReplies={quickReplies}
              onQuickReply={handleQuickReply}
              inputPlaceholder="Type your response..."
              className="h-[500px]"
            />
            
            {/* Continue button when complete */}
            {isScreenerComplete && (
              <div className="mt-4 flex justify-center">
                <Button onClick={handleChatComplete} size="lg">
                  Continue to Next Step
                </Button>
              </div>
            )}
          </>
        ) : (
          <ScreenerForm
            initialResponses={state.assessmentResponses}
            onSubmit={handleFormSubmit}
            onSaveProgress={handleFormSaveProgress}
          />
        )}
      </div>

      {/* Back button */}
      <div className="mt-8">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Previous Step
        </Button>
      </div>

      {/* Privacy reassurance */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-xs text-muted-foreground">
          Your responses are confidential and protected under HIPAA.
          This screening is not a diagnosis—it helps us connect you
          with the right level of care.
        </p>
      </div>
    </div>
  );
}

/**
 * Mode toggle component
 */
function ModeToggle({
  mode,
  onModeChange,
}: {
  mode: AssessmentMode;
  onModeChange: (mode: AssessmentMode) => void;
}) {
  return (
    <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-lg">
      <button
        type="button"
        onClick={() => onModeChange('chat')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          mode === 'chat'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-800'
        )}
        aria-pressed={mode === 'chat'}
      >
        <MessageCircle className="w-4 h-4" />
        Chat with AI
      </button>
      <button
        type="button"
        onClick={() => onModeChange('form')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          mode === 'form'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-800'
        )}
        aria-pressed={mode === 'form'}
      >
        <FileText className="w-4 h-4" />
        Standard Form
      </button>
    </div>
  );
}
