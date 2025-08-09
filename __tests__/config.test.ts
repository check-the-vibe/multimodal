import { AI_SDK_ENABLED, API_BASE_URL, apiUrl } from '../services/config';

describe('config defaults', () => {
  it('AI_SDK_ENABLED defaults to false', () => {
    expect(AI_SDK_ENABLED).toBe(false);
  });

  it('API_BASE_URL has a sane default', () => {
    expect(typeof API_BASE_URL).toBe('string');
    expect(API_BASE_URL.length).toBeGreaterThan(0);
  });

  it('apiUrl joins correctly', () => {
    const u = apiUrl('/api/chat');
    expect(u.endsWith('/api/chat')).toBe(true);
  });
});

