/**
 * @file useChatStream Hook
 * @description Custom hook for handling SSE streaming chat responses.
 *
 * @see {@link frontend/src/lib/api/stream-client.ts}
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { createChatStream, type SSECompleteEvent } from '@/lib/api/stream-client';

/**
 * Stream state
 */
interface StreamState {
  /** Whether stream is currently active */
  isStreaming: boolean;
  /** Accumulated content from stream */
  content: string;
  /** Error if stream failed */
  error: Error | null;
  /** Whether stream has completed */
  isComplete: boolean;
  /** Completion metadata */
  completionData: SSECompleteEvent | null;
}

/**
 * Hook configuration
 */
interface UseChatStreamConfig {
  /** API base URL */
  apiBaseUrl?: string;
  /** Auth token */
  token?: string;
  /** Callback on each chunk */
  onChunk?: (chunk: string, accumulated: string) => void;
  /** Callback when complete */
  onComplete?: (data: SSECompleteEvent) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Hook return type
 */
interface UseChatStreamReturn {
  /** Current stream state */
  state: StreamState;
  /** Start streaming a message */
  startStream: (conversationId: string, content: string) => void;
  /** Abort current stream */
  abortStream: () => void;
  /** Reset state */
  reset: () => void;
}

/**
 * Initial stream state
 */
const initialState: StreamState = {
  isStreaming: false,
  content: '',
  error: null,
  isComplete: false,
  completionData: null,
};

/**
 * Custom hook for SSE chat streaming
 *
 * @param config - Hook configuration
 * @returns Stream state and controls
 *
 * @example
 * ```tsx
 * const { state, startStream, abortStream } = useChatStream({
 *   onComplete: (data) => console.log('Complete:', data),
 * });
 *
 * // Start streaming
 * startStream('conv-123', 'Hello!');
 *
 * // Display streaming content
 * <p>{state.content}</p>
 * ```
 */
export function useChatStream(config: UseChatStreamConfig = {}): UseChatStreamReturn {
  const { apiBaseUrl, token, onChunk, onComplete, onError } = config;

  const [state, setState] = useState<StreamState>(initialState);
  const cleanupRef = useRef<(() => void) | null>(null);

  /**
   * Starts a new stream
   */
  const startStream = useCallback(
    (conversationId: string, content: string) => {
      // Abort any existing stream
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // Reset state
      setState({
        isStreaming: true,
        content: '',
        error: null,
        isComplete: false,
        completionData: null,
      });

      // Start new stream
      cleanupRef.current = createChatStream(conversationId, content, {
        baseUrl: apiBaseUrl,
        token,
        onStart: () => {
          setState((prev) => ({ ...prev, isStreaming: true }));
        },
        onChunk: (chunk, accumulated) => {
          setState((prev) => ({ ...prev, content: accumulated }));
          onChunk?.(chunk, accumulated);
        },
        onComplete: (data) => {
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            isComplete: true,
            completionData: data,
          }));
          onComplete?.(data);
          cleanupRef.current = null;
        },
        onError: (error) => {
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            error,
          }));
          onError?.(error);
          cleanupRef.current = null;
        },
      });
    },
    [apiBaseUrl, token, onChunk, onComplete, onError]
  );

  /**
   * Aborts the current stream
   */
  const abortStream = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
      setState((prev) => ({
        ...prev,
        isStreaming: false,
      }));
    }
  }, []);

  /**
   * Resets state to initial
   */
  const reset = useCallback(() => {
    abortStream();
    setState(initialState);
  }, [abortStream]);

  return {
    state,
    startStream,
    abortStream,
    reset,
  };
}

/**
 * Simplified hook for basic streaming needs
 */
export function useSimpleStream() {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const stream = useCallback((conversationId: string, message: string) => {
    setContent('');
    setIsStreaming(true);

    const cleanup = createChatStream(conversationId, message, {
      onChunk: (_, accumulated) => setContent(accumulated),
      onComplete: () => setIsStreaming(false),
      onError: () => setIsStreaming(false),
    });

    return cleanup;
  }, []);

  return { content, isStreaming, stream };
}

