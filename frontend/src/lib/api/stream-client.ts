/**
 * @file Stream Client
 * @description SSE client for streaming AI responses.
 *              Handles EventSource connections and message parsing.
 *
 * @see {@link backend/app/controllers/api/v1/chat_controller.rb}
 */

/**
 * SSE event types from the server
 */
export type SSEEventType = 'start' | 'chunk' | 'message' | 'error' | 'complete' | 'heartbeat';

/**
 * Base SSE event data
 */
interface SSEEventBase {
  type: SSEEventType;
}

/**
 * Chunk event data (streaming text)
 */
interface SSEChunkEvent extends SSEEventBase {
  type: 'chunk';
  chunk: string;
}

/**
 * Complete event data
 */
export interface SSECompleteEvent extends SSEEventBase {
  type: 'complete';
  message_id: string;
  risk_level: string;
  questions_completed: number;
  is_complete: boolean;
  show_safety_pivot: boolean;
}

/**
 * Error event data
 */
interface SSEErrorEvent extends SSEEventBase {
  type: 'error';
  error: string;
  code?: string;
}

/**
 * Union of all SSE event types
 */
export type SSEEventData = SSEChunkEvent | SSECompleteEvent | SSEErrorEvent | SSEEventBase;

/**
 * Stream client configuration
 */
interface StreamClientConfig {
  /** Base API URL */
  baseUrl?: string;
  /** Auth token */
  token?: string;
  /** Callback for each chunk */
  onChunk?: (chunk: string, accumulated: string) => void;
  /** Callback when stream completes */
  onComplete?: (data: SSECompleteEvent) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Callback when stream starts */
  onStart?: () => void;
}

/**
 * Creates an SSE stream for chat messages
 *
 * @param conversationId - Conversation ID
 * @param content - User message content
 * @param config - Stream configuration
 * @returns Cleanup function to abort the stream
 *
 * @example
 * ```ts
 * const cleanup = createChatStream('conv-123', 'Hello', {
 *   onChunk: (chunk, accumulated) => console.log(accumulated),
 *   onComplete: (data) => console.log('Done:', data),
 * });
 *
 * // To abort:
 * cleanup();
 * ```
 */
export function createChatStream(
  conversationId: string,
  content: string,
  config: StreamClientConfig
): () => void {
  const {
    baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    onChunk,
    onComplete,
    onError,
    onStart,
  } = config;

  // Build URL with content as query param
  const url = new URL(`${baseUrl}/conversations/${conversationId}/stream`);
  url.searchParams.set('content', content);

  // Create EventSource
  // Note: EventSource doesn't support custom headers, so we use query params
  // For auth, consider using cookies or a different approach
  const eventSource = new EventSource(url.toString());

  let accumulated = '';

  // Handle open
  eventSource.onopen = () => {
    onStart?.();
  };

  // Handle messages
  eventSource.onmessage = (event) => {
    try {
      const data: SSEEventData = JSON.parse(event.data);

      switch (data.type) {
        case 'chunk':
          accumulated += (data as SSEChunkEvent).chunk;
          onChunk?.((data as SSEChunkEvent).chunk, accumulated);
          break;

        case 'complete':
          onComplete?.(data as SSECompleteEvent);
          eventSource.close();
          break;

        case 'error':
          onError?.(new Error((data as SSEErrorEvent).error));
          eventSource.close();
          break;
      }
    } catch {
      // Non-JSON data, might be raw text
      accumulated += event.data;
      onChunk?.(event.data, accumulated);
    }
  };

  // Handle specific event types
  eventSource.addEventListener('chunk', (event: MessageEvent) => {
    try {
      const data: SSEChunkEvent = JSON.parse(event.data);
      accumulated += data.chunk;
      onChunk?.(data.chunk, accumulated);
    } catch {
      // Ignore parse errors
    }
  });

  eventSource.addEventListener('complete', (event: MessageEvent) => {
    try {
      const data: SSECompleteEvent = JSON.parse(event.data);
      onComplete?.(data);
      eventSource.close();
    } catch {
      // Ignore parse errors
    }
  });

  eventSource.addEventListener('error', (event: MessageEvent) => {
    try {
      const data: SSEErrorEvent = JSON.parse(event.data);
      onError?.(new Error(data.error));
    } catch {
      onError?.(new Error('Stream error'));
    }
    eventSource.close();
  });

  // Handle connection errors
  eventSource.onerror = () => {
    if (eventSource.readyState === EventSource.CLOSED) {
      // Normal close, ignore
      return;
    }
    onError?.(new Error('Connection lost'));
    eventSource.close();
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

/**
 * Fetch-based streaming for more control (supports POST)
 */
export async function streamChatMessage(
  conversationId: string,
  content: string,
  config: StreamClientConfig
): Promise<void> {
  const {
    baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    token,
    onChunk,
    onComplete,
    onError,
    onStart,
  } = config;

  try {
    const response = await fetch(
      `${baseUrl}/conversations/${conversationId}/stream?content=${encodeURIComponent(content)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    onStart?.();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.type === 'chunk') {
              accumulated += parsed.chunk;
              onChunk?.(parsed.chunk, accumulated);
            } else if (parsed.type === 'complete') {
              onComplete?.(parsed);
            } else if (parsed.type === 'error') {
              throw new Error(parsed.error);
            }
          } catch {
            // Non-JSON data
            accumulated += data;
            onChunk?.(data, accumulated);
          }
        }
      }
    }
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error('Stream failed'));
  }
}

