import { expect, test, describe, vi, beforeEach } from "vitest";
import { fetchGitHubProfile, fetchUserRepositories } from "../../app/server/github";

describe("GitHub API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("fetchGitHubProfile returns mapped user data", async () => {
    const mockGraphQLResponse = {
      data: {
        user: {
          login: "testuser",
          name: "Test User",
          bio: "Test bio",
          avatarUrl: "https://avatar.url",
          url: "https://github.com/testuser",
          followers: { totalCount: 10 },
          repositories: { totalCount: 5, nodes: [] },
          contributionsCollection: {
            contributionCalendar: {
              weeks: [
                {
                  contributionDays: [
                    { date: "2024-01-01", contributionCount: 5, color: "#ebedf0" }
                  ]
                }
              ]
            },
            totalPullRequestContributions: 10,
            totalPullRequestReviewContributions: 5
          }
        }
      }
    };

    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(mockGraphQLResponse), { status: 200 }));

    const user = await fetchGitHubProfile("testuser");
    expect(user.login).toBe("testuser");
    expect(user.name).toBe("Test User");
    expect(user.avatarUrl).toBe("https://avatar.url");
    expect(user.followers).toBe(10);
    expect(user.publicRepos).toBe(5);
    expect(user.contributionCalendar).toHaveLength(1);
    expect(user.contributionCalendar[0].contributionCount).toBe(5);
  });

  test("fetchGitHubProfile throws error if not found", async () => {
    const mockNotFoundResponse = {
      data: {
        user: null
      }
    };
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(mockNotFoundResponse), { status: 200 }));

    await expect(fetchGitHubProfile("unknown")).rejects.toThrow("User not found");
  });

  test("fetchUserRepositories returns mapped repository data", async () => {
    const mockGraphQLResponse = {
      data: {
        user: {
          repositories: {
            nodes: [
              {
                name: "repo1",
                description: "desc1",
                stargazerCount: 10,
                forkCount: 2,
                primaryLanguage: { name: "TypeScript" },
                url: "https://github.com/repo1",
                isInOrganization: false,
              },
            ],
          },
        },
      }
    };

    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(mockGraphQLResponse), { status: 200 }));

    const repos = await fetchUserRepositories("testuser");
    expect(repos).toHaveLength(1);
    expect(repos[0].name).toBe("repo1");
    expect(repos[0].primaryLanguage?.name).toBe("TypeScript");
    expect(repos[0].stargazerCount).toBe(10);
  });
});
