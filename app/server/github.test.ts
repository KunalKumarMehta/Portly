import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchGitHubProfile, fetchUserRepositories } from './github';

global.fetch = vi.fn();

describe('github server actions', () => {
  const username = 'testuser';
  const token = 'ghp_test_token';

  beforeEach(() => {
    vi.stubEnv('GITHUB_TOKEN', token);
    vi.clearAllMocks();
  });

  describe('fetchGitHubProfile', () => {
    it('should fetch user profile using GraphQL', async () => {
      const mockResponse = {
        data: {
          user: {
            login: 'testuser',
            name: 'Test User',
            bio: 'Test Bio',
            avatarUrl: 'https://avatar.url',
            url: 'https://github.com/testuser',
            followers: { totalCount: 10 },
            repositories: { totalCount: 5, nodes: [] },
            contributionsCollection: {
              contributionCalendar: {
                weeks: [
                  {
                    contributionDays: [
                      { date: '2023-01-01', contributionCount: 5, color: '#ebedf0' }
                    ]
                  }
                ]
              },
              totalPullRequestContributions: 10,
              totalPullRequestReviewContributions: 5
            },
            repositories: {
              nodes: []
            }
          }
        }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const profile = await fetchGitHubProfile(username);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining(username)
        })
      );

      expect(profile.name).toBe('Test User');
      expect(profile.contributionCalendar).toHaveLength(1);
      expect(profile.externalContributions).toBe(10);
      expect(profile.reviewsGiven).toBe(5);
    });

    it('should throw error if user not found', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { user: null } })
      });

      await expect(fetchGitHubProfile(username)).rejects.toThrow('User not found');
    });
  });

  describe('fetchUserRepositories', () => {
    it('should fetch and map repositories correctly', async () => {
       const mockResponse = {
        data: {
          user: {
            repositories: {
              nodes: [
                {
                  name: 'repo1',
                  stargazerCount: 10,
                  forkCount: 2,
                  primaryLanguage: { name: 'TypeScript' },
                  url: 'https://github.com/repo1',
                  isInOrganization: true
                },
                {
                  name: 'repo2',
                  stargazerCount: 5,
                  forkCount: 1,
                  primaryLanguage: null,
                  url: 'https://github.com/repo2',
                  isInOrganization: false
                }
              ]
            }
          }
        }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const repos = await fetchUserRepositories(username);

      expect(repos).toHaveLength(2);
      expect(repos[0].isExternal).toBe(true);
      expect(repos[1].isExternal).toBe(false);
      expect(repos[0].primaryLanguage?.name).toBe('TypeScript');
    });
  });
});
