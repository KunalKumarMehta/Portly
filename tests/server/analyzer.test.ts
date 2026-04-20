import { expect, test, describe } from "vitest";
import { analyzePortfolio } from "../../app/server/analyzer";
import type { GitHubUser, GitHubRepository } from "../../app/types/portfolio";

describe("analyzePortfolio", () => {
  const mockUser: GitHubUser = {
    login: "testuser",
    name: "Test User",
    avatarUrl: "https://example.com/avatar.png",
    bio: "Test bio",
    url: "https://github.com/testuser",
  };

  const mockRepos: GitHubRepository[] = [
    {
      name: "repo1",
      description: "description 1",
      url: "https://github.com/testuser/repo1",
      stargazerCount: 10,
      primaryLanguage: { name: "TypeScript", color: "#3178c6" },
      forkCount: 2,
    },
    {
      name: "repo2",
      description: "description 2",
      url: "https://github.com/testuser/repo2",
      stargazerCount: 5,
      primaryLanguage: { name: "JavaScript", color: "#f1e05a" },
      forkCount: 1,
    },
    {
      name: "repo3",
      description: "description 3",
      url: "https://github.com/testuser/repo3",
      stargazerCount: 15,
      primaryLanguage: { name: "TypeScript", color: "#3178c6" },
      forkCount: 3,
    },
  ];

  test("should correctly calculate total stars", () => {
    const result = analyzePortfolio(mockUser, mockRepos);
    expect(result.totalStars).toBe(30);
  });

  test("should correctly identify top languages", () => {
    const result = analyzePortfolio(mockUser, mockRepos);
    expect(result.topLanguages).toEqual({
      TypeScript: 2,
      JavaScript: 1,
    });
  });

  test("should sort repositories by star count", () => {
    const result = analyzePortfolio(mockUser, mockRepos);
    expect(result.topRepositories[0].name).toBe("repo3");
    expect(result.topRepositories[1].name).toBe("repo1");
    expect(result.topRepositories[2].name).toBe("repo2");
  });

  test("should limit top repositories to 6", () => {
    const manyRepos = Array(10).fill(null).map((_, i) => ({
      ...mockRepos[0],
      name: `repo${i}`,
      stargazerCount: i,
    }));
    const result = analyzePortfolio(mockUser, manyRepos);
    expect(result.topRepositories.length).toBe(6);
  });

  test("should not mutate the input repositories array", () => {
    const repos = [
      { ...mockRepos[0], name: "repo1", stargazerCount: 10 },
      { ...mockRepos[1], name: "repo2", stargazerCount: 5 },
      { ...mockRepos[2], name: "repo3", stargazerCount: 15 },
    ];
    analyzePortfolio(mockUser, repos);
    expect(repos[0].name).toBe("repo1");
    expect(repos[1].name).toBe("repo2");
    expect(repos[2].name).toBe("repo3");
  });
});
