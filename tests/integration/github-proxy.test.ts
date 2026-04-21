import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchGitHubProfile } from '../../app/server/github';
import { handler } from '../../netlify/functions/github-proxy';

describe('GitHub Proxy Integration', () => {
  const originalFetch = globalThis.fetch;
  const mockToken = 'test-github-token';

  beforeEach(() => {
    process.env.GITHUB_TOKEN = mockToken;
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    process.env.GITHUB_TOKEN = undefined;
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should verify end-to-end interaction between GitHub service and Netlify proxy', async () => {
    const username = 'testuser';
    const mockGitHubData = {
      data: {
        user: {
          login: 'testuser',
          name: 'Test User',
          bio: 'Bio',
          avatarUrl: 'https://avatar.com',
          url: 'https://github.com/testuser',
          followers: { totalCount: 10 },
          repositories: {
            totalCount: 5,
            nodes: []
          },
          contributionsCollection: {
            contributionCalendar: {
              weeks: []
            },
            totalPullRequestContributions: 2,
            totalPullRequestReviewContributions: 3
          }
        }
      }
    };

    // 1. First fetch call should be from fetchGitHubProfile to the proxy
    (globalThis.fetch as any).mockImplementationOnce(async (url: string, options: any) => {
      expect(url).toBe('/.netlify/functions/github-proxy');
      expect(options.method).toBe('POST');
      
      const body = JSON.parse(options.body);
      
      // 2. Simulate the Netlify environment by calling the handler directly
      const event = {
        httpMethod: 'POST',
        body: options.body,
        headers: options.headers
      } as any;

      // Mock the second fetch call (from proxy to GitHub)
      (globalThis.fetch as any).mockImplementationOnce(async (githubUrl: string, githubOptions: any) => {
        expect(githubUrl).toBe('https://api.github.com/graphql');
        expect(githubOptions.headers.Authorization).toBe(`Bearer ${mockToken}`);
        expect(JSON.parse(githubOptions.body)).toEqual(body);

        return {
          ok: true,
          status: 200,
          json: async () => mockGitHubData
        };
      });

      const response = await handler(event, {} as any, () => {});
      
      return {
        ok: response!.statusCode === 200,
        status: response!.statusCode,
        json: async () => JSON.parse(response!.body!)
      };
    });

    const result = await fetchGitHubProfile(username);

    expect(result.login).toBe('testuser');
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });
});
