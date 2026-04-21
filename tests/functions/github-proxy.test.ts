import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../../netlify/functions/github-proxy';

describe('github-proxy handler', () => {
  beforeEach(() => {
    vi.stubEnv('GITHUB_TOKEN', 'test-token');
    // Mock global fetch
    global.fetch = vi.fn();
  });

  it('should return 405 for GET requests', async () => {
    const event = { httpMethod: 'GET' } as any;
    const response = await handler(event, {} as any);
    expect(response?.statusCode).toBe(405);
  });

  it('should return 500 if GITHUB_TOKEN is missing', async () => {
    vi.stubEnv('GITHUB_TOKEN', '');
    const event = { httpMethod: 'POST', body: '{}' } as any;
    const response = await handler(event, {} as any);
    expect(response?.statusCode).toBe(500);
    expect(JSON.parse(response?.body || '{}').error).toBe('GITHUB_TOKEN not configured');
  });

  it('should forward request to GitHub and return response', async () => {
    const mockGithubResponse = { data: { viewer: { login: 'octocat' } } };
    (global.fetch as any).mockResolvedValue({
      status: 200,
      json: async () => mockGithubResponse,
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ query: '{ viewer { login } }', variables: {} }),
    } as any;

    const response = await handler(event, {} as any);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ query: '{ viewer { login } }', variables: {} }),
      })
    );

    expect(response?.statusCode).toBe(200);
    expect(JSON.parse(response?.body || '{}')).toEqual(mockGithubResponse);
  });

  it('should return 500 on fetch error', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ query: '{ viewer { login } }' }),
    } as any;

    const response = await handler(event, {} as any);
    expect(response?.statusCode).toBe(500);
    expect(JSON.parse(response?.body || '{}').error).toBe('Network error');
  });
});
