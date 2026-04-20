import { expect, test, describe, vi, beforeEach } from "vitest";
import { fetchGitHubProfile, fetchUserRepositories } from "../../app/server/github";

describe("GitHub API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("fetchGitHubProfile returns mapped user data", async () => {
    const mockUser = {
      login: "testuser",
      name: "Test User",
      avatar_url: "https://avatar.url",
      bio: "Test bio",
      followers: 10,
      public_repos: 5,
    };

    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(mockUser), { status: 200 }));

    const user = await fetchGitHubProfile("testuser");
    expect(user.login).toBe("testuser");
    expect(user.name).toBe("Test User");
    expect(user.avatarUrl).toBe("https://avatar.url");
  });

  test("fetchGitHubProfile throws error if not found", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("Not Found", { status: 404 }));

    await expect(fetchGitHubProfile("unknown")).rejects.toThrow("User not found");
  });

  test("fetchUserRepositories returns mapped repository data", async () => {
    const mockRepos = [
      {
        name: "repo1",
        description: "desc1",
        stargazers_count: 10,
        forks_count: 2,
        language: "TypeScript",
        html_url: "https://github.com/repo1",
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(mockRepos), { status: 200 }));

    const repos = await fetchUserRepositories("testuser");
    expect(repos).toHaveLength(1);
    expect(repos[0].name).toBe("repo1");
    expect(repos[0].primaryLanguage?.name).toBe("TypeScript");
  });
});
