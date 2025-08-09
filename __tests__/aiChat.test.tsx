// Mocks for AI SDK and Expo fetch
jest.mock('ai', () => {
  return {
    DefaultChatTransport: jest.fn().mockImplementation((opts) => ({ __opts: opts })),
  };
});

jest.mock('@ai-sdk/react', () => {
  return {
    useChat: jest.fn(() => ({
      messages: [],
      input: '',
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
      error: null,
      append: jest.fn(async () => {}),
    })),
  };
});

// Provide a virtual expo/fetch for Node test env
jest.mock('expo/fetch', () => ({ fetch: global.fetch }), { virtual: true });

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useAIChat } from '../hooks/useAIChat';
import { apiUrl } from '../services/config';

describe('useAIChat hook', () => {
  it('initializes useChat with transport and body', () => {
    const { useChat } = require('@ai-sdk/react');
    const { DefaultChatTransport } = require('ai');

    let captured: any = null;
    function Test() {
      captured = useAIChat('openai', 'gpt-4o');
      return null;
    }
    act(() => {
      renderer.create(<Test />);
    });

    // useChat should be called with transport and provider/model body
    expect(useChat).toHaveBeenCalled();
    const call = (useChat as jest.Mock).mock.calls[0][0];
    expect(call.body).toEqual({ provider: 'openai', model: 'gpt-4o' });
    expect(call.transport).toBeTruthy();
    // DefaultChatTransport should have been constructed with our API URL
    const transportCall = (DefaultChatTransport as jest.Mock).mock.calls[0][0];
    expect(transportCall.api).toBe(apiUrl('/api/chat'));
  });
});
