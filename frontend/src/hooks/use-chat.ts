/**
 * @file useChat Hook
 * @description Custom hook for managing chat state and interactions.
 *              Handles messages, sending, and streaming with real API integration.
 *              Includes question progression tracking for screener assessments.
 *
 * @see {@link frontend/src/components/chat/chat-container.tsx}
 */

'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import type { ChatMessageData, MessageSender } from '@/components/chat/chat-message';
import type { QuickReplyOption } from '@/components/chat/quick-replies';
import type { ScreenerType } from '@/stores/onboarding-store';
import type { ScreenerQuestion, ResponseOption } from '@/lib/constants/screeners/psc-17';
import { PSC17_QUESTIONS, PSC17_RESPONSE_OPTIONS } from '@/lib/constants/screeners/psc-17';
import { SCARED_QUESTIONS, SCARED_RESPONSE_OPTIONS } from '@/lib/constants/screeners/scared';
import { PHQ9A_QUESTIONS, PHQ9A_RESPONSE_OPTIONS } from '@/lib/constants/screeners/phq9a';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * Screener configuration for chat
 */
interface ChatScreenerConfig {
  questions: ScreenerQuestion[];
  options: ResponseOption[];
  name: string;
  instructions: string;
}

/**
 * Gets screener configuration for chat based on screener type
 */
function getScreenerConfig(screenerType: ScreenerType): ChatScreenerConfig {
  switch (screenerType) {
    case 'phq9a':
      return {
        questions: PHQ9A_QUESTIONS,
        options: PHQ9A_RESPONSE_OPTIONS,
        name: 'PHQ-9A',
        instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
      };
    case 'scared':
      return {
        questions: SCARED_QUESTIONS,
        options: SCARED_RESPONSE_OPTIONS,
        name: 'SCARED-5',
        instructions: 'Please indicate how often each statement describes you.',
      };
    case 'psc17':
    default:
      return {
        questions: PSC17_QUESTIONS,
        options: PSC17_RESPONSE_OPTIONS,
        name: 'PSC-17',
        instructions: 'Please indicate how often each statement applies to your child.',
      };
  }
}

/**
 * Chat hook configuration
 */
interface UseChatConfig {
  /** Initial messages to display */
  initialMessages?: ChatMessageData[];
  /** Conversation ID for API calls */
  conversationId?: string;
  /** Screener type to use (defaults to psc17) */
  screenerType?: ScreenerType;
  /** Callback when message is sent */
  onMessageSent?: (message: ChatMessageData) => void;
  /** Callback when AI response is received */
  onAIResponse?: (message: ChatMessageData) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Callback when quick replies should be updated */
  onQuickRepliesUpdate?: (options: QuickReplyOption[]) => void;
  /** Callback when screener is completed */
  onScreenerComplete?: (responses: Record<string, number>) => void;
}

/**
 * Chat hook return type
 */
interface UseChatReturn {
  /** Current messages */
  messages: ChatMessageData[];
  /** Whether AI is typing */
  isTyping: boolean;
  /** Whether a message is being sent */
  isSending: boolean;
  /** Current error (if any) */
  error: Error | null;
  /** Quick reply options to show */
  quickReplies: QuickReplyOption[];
  /** Current question index (for screener mode) */
  currentQuestionIndex: number;
  /** Total number of questions */
  totalQuestions: number;
  /** Whether screener is complete */
  isScreenerComplete: boolean;
  /** Collected screener responses */
  screenerResponses: Record<string, number>;
  /** Send a text message */
  sendMessage: (content: string) => Promise<void>;
  /** Send a quick reply */
  sendQuickReply: (option: QuickReplyOption) => Promise<void>;
  /** Add a message (internal use) */
  addMessage: (message: ChatMessageData) => void;
  /** Set quick reply options */
  setQuickReplies: (options: QuickReplyOption[]) => void;
  /** Clear all messages */
  clearMessages: () => void;
  /** Reset error state */
  clearError: () => void;
}

/**
 * Generates a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Creates a new message object
 */
function createMessage(
  sender: MessageSender,
  content: string,
  isStreaming = false
): ChatMessageData {
  return {
    id: generateMessageId(),
    sender,
    content,
    timestamp: new Date(),
    isStreaming,
  };
}

/**
 * Custom hook for managing chat state
 *
 * @param config - Hook configuration
 * @returns Chat state and actions
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isTyping } = useChat({
 *   conversationId: 'conv_123',
 *   onAIResponse: (msg) => console.log('AI said:', msg.content),
 * });
 * ```
 */
export function useChat(config: UseChatConfig = {}): UseChatReturn {
  const {
    initialMessages = [],
    conversationId,
    screenerType = 'psc17',
    onMessageSent,
    onAIResponse,
    onError,
    onScreenerComplete,
  } = config;

  // Get screener configuration based on type
  const screenerConfig = useMemo(() => getScreenerConfig(screenerType), [screenerType]);
  const { questions: screenerQuestions, options: screenerOptions, name: screenerName } = screenerConfig;

  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [quickReplies, setQuickReplies] = useState<QuickReplyOption[]>([]);
  
  // Screener state tracking
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 = intro, 0+ = questions
  const [screenerResponses, setScreenerResponses] = useState<Record<string, number>>({});
  const [isScreenerComplete, setIsScreenerComplete] = useState(false);
  const totalQuestions = screenerQuestions.length;

  // Ref for tracking streaming message updates
  const streamingMessageRef = useRef<string | null>(null);
  
  // Ref for screener complete callback
  const onScreenerCompleteRef = useRef(onScreenerComplete);
  onScreenerCompleteRef.current = onScreenerComplete;
  
  // Refs for screener config to use in callbacks
  const screenerQuestionsRef = useRef(screenerQuestions);
  const screenerOptionsRef = useRef(screenerOptions);
  const screenerNameRef = useRef(screenerName);
  screenerQuestionsRef.current = screenerQuestions;
  screenerOptionsRef.current = screenerOptions;
  screenerNameRef.current = screenerName;

  /**
   * Adds a message to the chat
   */
  const addMessage = useCallback((message: ChatMessageData) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Updates the last message (for streaming)
   */
  const updateLastMessage = useCallback((content: string, isStreaming: boolean) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        ...updated[lastIndex],
        content,
        isStreaming,
      };
      return updated;
    });
  }, []);

  /**
   * Sends a user message to the API
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setError(null);
      setIsSending(true);
      setQuickReplies([]); // Clear quick replies when user sends message

      // Add user message immediately
      const userMessage = createMessage('user', content);
      addMessage(userMessage);
      onMessageSent?.(userMessage);

      try {
        setIsTyping(true);

        // Call the real API
        if (conversationId) {
          const response = await fetch(
            `${API_BASE_URL}/conversations/${conversationId}/messages`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({ content }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to send message');
          }

          const data = await response.json();
          
          if (data.success && data.data?.message) {
            const aiContent = data.data.message.content;
            const aiMessage = createMessage('ai', aiContent);
            addMessage(aiMessage);
            onAIResponse?.(aiMessage);

            // Update quick replies based on response if available
            if (data.data.quick_replies) {
              setQuickReplies(data.data.quick_replies);
            }
          }
        } else {
          // Fallback to simulated screener response when no conversation ID
          const aiMessage = createMessage('ai', '', true);
          streamingMessageRef.current = aiMessage.id;
          addMessage(aiMessage);

          // Use screener-aware response generation with dynamic config
          const { response, newQuestionIndex, responseValue } = generateScreenerResponse(
            content,
            currentQuestionIndex,
            screenerQuestionsRef.current,
            screenerOptionsRef.current,
            screenerNameRef.current
          );

          // Stream the response
          let accumulated = '';
          for (const char of response) {
            accumulated += char;
            updateLastMessage(accumulated, true);
            await new Promise((resolve) => setTimeout(resolve, 15));
          }

          // Mark streaming complete
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0) {
              updated[lastIndex] = { ...updated[lastIndex], isStreaming: false };
            }
            return updated;
          });
          streamingMessageRef.current = null;

          // Record the response if a question was answered
          if (currentQuestionIndex >= 0 && responseValue !== null) {
            const questions = screenerQuestionsRef.current;
            const questionId = questions[currentQuestionIndex].id;
            setScreenerResponses((prev) => {
              const newResponses = { ...prev, [questionId]: responseValue };
              
              // Check if screener is complete
              if (newQuestionIndex >= questions.length) {
                setIsScreenerComplete(true);
                // Call completion callback with all responses
                setTimeout(() => onScreenerCompleteRef.current?.(newResponses), 0);
              }
              
              return newResponses;
            });
          }

          // Update question index
          setCurrentQuestionIndex(newQuestionIndex);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send message');
        setError(error);
        onError?.(error);
      } finally {
        setIsTyping(false);
        setIsSending(false);
      }
    },
    [conversationId, addMessage, updateLastMessage, onMessageSent, onAIResponse, onError, currentQuestionIndex]
  );

  /**
   * Sends a quick reply
   */
  const sendQuickReply = useCallback(
    async (option: QuickReplyOption) => {
      await sendMessage(option.label);
    },
    [sendMessage]
  );

  /**
   * Clears all messages and resets screener state
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setQuickReplies([]);
    setError(null);
    setCurrentQuestionIndex(-1);
    setScreenerResponses({});
    setIsScreenerComplete(false);
  }, []);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    isSending,
    error,
    quickReplies,
    currentQuestionIndex,
    totalQuestions,
    isScreenerComplete,
    screenerResponses,
    sendMessage,
    sendQuickReply,
    addMessage,
    setQuickReplies,
    clearMessages,
    clearError,
  };
}

/**
 * Response value mapping for screener answers
 * Maps common user responses to numeric values (works for all screener types)
 */
const RESPONSE_VALUE_MAP: Record<string, number> = {
  // Common responses mapping to 0
  'not true': 0,
  'hardly ever': 0,
  'never': 0,
  'not at all': 0,
  // Common responses mapping to 1
  'somewhat': 1,
  'sometimes': 1,
  'several days': 1,
  // Common responses mapping to 2
  'very true': 2,
  'often': 2,
  'more than half': 2,
  // Common responses mapping to 3 (for PHQ-9A)
  'nearly every day': 3,
  'always': 3,
};

/**
 * Generates screener response with proper question progression
 * 
 * @param userMessage - The user's message
 * @param currentIndex - Current question index (-1 for intro)
 * @param questions - Array of screener questions
 * @param options - Array of response options
 * @param screenerName - Name of the screener for display
 * @returns Response text, new question index, and response value if applicable
 */
function generateScreenerResponse(
  userMessage: string,
  currentIndex: number,
  questions: ScreenerQuestion[],
  options: ResponseOption[],
  screenerName: string
): { response: string; newQuestionIndex: number; responseValue: number | null } {
  const lowerMsg = userMessage.toLowerCase().trim();
  const totalQuestions = questions.length;
  
  // Build option labels for prompts
  const optionLabels = options.map(o => o.label.split(' ')[0]).join(', ');
  
  // Check if user is starting the assessment
  if (currentIndex === -1) {
    if (lowerMsg.includes('ready') || lowerMsg.includes('yes') || lowerMsg.includes('start')) {
      const firstQuestion = questions[0];
      return {
        response: `Great! Let's begin. I'll ask you ${totalQuestions} questions.\n\nQuestion 1 of ${totalQuestions}: ${firstQuestion.text}?\n\nPlease respond with: ${optionLabels}`,
        newQuestionIndex: 0,
        responseValue: null,
      };
    }
    
    if (lowerMsg.includes('more') || lowerMsg.includes('tell me')) {
      return {
        response: `Of course! This is a brief ${screenerName} assessment that helps us understand how we can best support you. The questions are straightforward and there are no right or wrong answers. Are you ready to begin?`,
        newQuestionIndex: -1,
        responseValue: null,
      };
    }
    
    // Default intro response
    return {
      response: "I'm here to help guide you through a brief wellness check. Are you ready to start?",
      newQuestionIndex: -1,
      responseValue: null,
    };
  }
  
  // User is answering a screener question
  let responseValue: number | null = null;
  
  // First check for option label matches (more specific)
  for (const option of options) {
    const optionLower = option.label.toLowerCase();
    if (lowerMsg.includes(optionLower) || optionLower.includes(lowerMsg)) {
      responseValue = option.value;
      break;
    }
    // Also check first word of label
    const firstWord = optionLower.split(' ')[0];
    if (lowerMsg.includes(firstWord)) {
      responseValue = option.value;
      break;
    }
  }
  
  // Fall back to general response mapping
  if (responseValue === null) {
    for (const [key, value] of Object.entries(RESPONSE_VALUE_MAP)) {
      if (lowerMsg.includes(key)) {
        responseValue = value;
        break;
      }
    }
  }
  
  // If we couldn't parse a valid response, ask again
  if (responseValue === null) {
    const currentQuestion = questions[currentIndex];
    return {
      response: `I didn't quite catch that. For the question "${currentQuestion.text}", please respond with: ${optionLabels}`,
      newQuestionIndex: currentIndex,
      responseValue: null,
    };
  }
  
  // Valid response - move to next question
  const nextIndex = currentIndex + 1;
  
  // Check if assessment is complete
  if (nextIndex >= totalQuestions) {
    return {
      response: "Thank you for completing the assessment! Your responses have been recorded. Based on what you've shared, I'll help connect you with the right support. Let's continue to the next step.",
      newQuestionIndex: nextIndex,
      responseValue,
    };
  }
  
  // Get next question
  const nextQuestion = questions[nextIndex];
  const acknowledgments = [
    "Thank you for that answer.",
    "Got it, thanks.",
    "I appreciate you sharing that.",
    "Thank you.",
    "Okay, noted.",
  ];
  const ack = acknowledgments[nextIndex % acknowledgments.length];
  
  return {
    response: `${ack}\n\nQuestion ${nextIndex + 1} of ${totalQuestions}: ${nextQuestion.text}?\n\nPlease respond with: ${optionLabels}`,
    newQuestionIndex: nextIndex,
    responseValue,
  };
}

/**
 * Hook for managing chat with API integration
 * Extended version with real API calls
 */
export function useChatWithAPI(
  conversationId: string,
  apiBaseUrl: string = '/api/v1'
): UseChatReturn & {
  loadHistory: () => Promise<void>;
  isLoadingHistory: boolean;
} {
  const chatState = useChat({ conversationId });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  /**
   * Loads conversation history from API
   */
  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`${apiBaseUrl}/conversations/${conversationId}`);
      if (!response.ok) throw new Error('Failed to load conversation');

      const data = await response.json();
      if (data.messages) {
        data.messages.forEach((msg: { sender: MessageSender; content: string; created_at: string }) => {
          chatState.addMessage({
            id: generateMessageId(),
            sender: msg.sender,
            content: msg.content,
            timestamp: new Date(msg.created_at),
          });
        });
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [conversationId, apiBaseUrl, chatState]);

  return {
    ...chatState,
    loadHistory,
    isLoadingHistory,
  };
}

