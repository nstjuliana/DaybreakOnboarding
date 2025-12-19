/**
 * @file useChat Hook
 * @description Custom hook for managing chat state and interactions.
 *              Handles messages, sending, and streaming.
 *
 * @see {@link frontend/src/components/chat/chat-container.tsx}
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessageData, MessageSender } from '@/components/chat/chat-message';
import type { QuickReplyOption } from '@/components/chat/quick-replies';

/**
 * Chat hook configuration
 */
interface UseChatConfig {
  /** Initial messages to display */
  initialMessages?: ChatMessageData[];
  /** Conversation ID for API calls */
  conversationId?: string;
  /** Callback when message is sent */
  onMessageSent?: (message: ChatMessageData) => void;
  /** Callback when AI response is received */
  onAIResponse?: (message: ChatMessageData) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
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
    onMessageSent,
    onAIResponse,
    onError,
  } = config;

  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [quickReplies, setQuickReplies] = useState<QuickReplyOption[]>([]);

  // Ref for tracking streaming message updates
  const streamingMessageRef = useRef<string | null>(null);

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
   * Sends a user message
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setError(null);
      setIsSending(true);
      setQuickReplies([]); // Clear quick replies when user sends message

      // Add user message
      const userMessage = createMessage('user', content);
      addMessage(userMessage);
      onMessageSent?.(userMessage);

      try {
        // Simulate API call for now - will be replaced with real API
        setIsTyping(true);

        // Add placeholder for AI response
        const aiMessage = createMessage('ai', '', true);
        streamingMessageRef.current = aiMessage.id;
        addMessage(aiMessage);

        // Simulate streaming response (replace with real API)
        await simulateAIResponse(content, (chunk) => {
          updateLastMessage(chunk, true);
        });

        // Mark streaming complete
        updateLastMessage(messages[messages.length - 1]?.content || '', false);
        streamingMessageRef.current = null;

        // Notify completion
        const finalMessage = messages[messages.length - 1];
        if (finalMessage) {
          onAIResponse?.(finalMessage);
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
    [addMessage, updateLastMessage, messages, onMessageSent, onAIResponse, onError]
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
   * Clears all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setQuickReplies([]);
    setError(null);
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
    sendMessage,
    sendQuickReply,
    addMessage,
    setQuickReplies,
    clearMessages,
    clearError,
  };
}

/**
 * Simulates AI response for development
 * Replace with actual API call
 */
async function simulateAIResponse(
  userMessage: string,
  onChunk: (content: string) => void
): Promise<void> {
  const responses = [
    "Thank you for sharing that with me. I hear what you're saying.",
    "I appreciate you taking the time to answer. Let me ask the next question.",
    "That's helpful to know. Your responses help me understand better.",
  ];

  const response = responses[Math.floor(Math.random() * responses.length)];
  let accumulated = '';

  // Simulate streaming by sending chunks
  for (const char of response) {
    accumulated += char;
    onChunk(accumulated);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
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

