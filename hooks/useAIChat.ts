import { useState, useCallback, useRef } from 'react';
import { AI_SDK_ENABLED, apiUrl, DEFAULT_PROVIDER, DEFAULT_MODEL } from '../services/config';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function useAIChat(provider: string = DEFAULT_PROVIDER, model: string = DEFAULT_MODEL) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string, onChunk?: (chunk: string) => void) => {
    if (!AI_SDK_ENABLED) {
      // Fallback to mock for testing
      console.log('AI SDK disabled, using mock response');
      const mockResponse = `Mock response to: ${content}`;
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'user', content },
        { id: (Date.now() + 1).toString(), role: 'assistant', content: mockResponse },
      ]);
      return mockResponse;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          provider,
          model,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      const assistantId = (Date.now() + 1).toString();

      if (!reader) {
        throw new Error('No response body');
      }

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Parse SSE data
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim()) {
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'text' && parsed.content) {
                  assistantMessage += parsed.content;
                  
                  // Update the assistant message
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantId 
                      ? { ...msg, content: assistantMessage }
                      : msg
                  ));
                  
                  // Call the chunk callback if provided
                  if (onChunk) {
                    onChunk(parsed.content);
                  }
                } else if (parsed.type === 'done') {
                  // Stream completed
                  break;
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }

      return assistantMessage;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return null;
      }
      
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      console.error('Chat error:', err);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
      }]);
      
      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, provider, model]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    error,
    abort,
  };
}