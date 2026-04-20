import { expect, test, describe } from "vitest";
import { analyzePortfolio, calculateImpactScore, extractWorkPattern } from "../../app/server/analyzer";
import type { GitHubUser, GitHubRepository } from "../../app/types/portfolio";

describe("analyzer logic", () => {
  const mockUser: GitHubUser = {
    login: "testuser",
    name: "Test User",
    avatarUrl: "https://example.com/avatar.png",
    bio: "Test bio",
    url: "https://github.com/testuser",
    followers: 100,
    publicRepos: 10,
    contributionYears: [2023, 2024],
    externalContributions: 15,
    reviewsGiven: 20,
    contributionCalendar: [],
  };

  const mockRepos: GitHubRepository[] = [
    {
      name: "repo1",
      description: "description 1",
      url: "https://github.com/testuser/repo1",
      stargazerCount: 10,
      primaryLanguage: { name: "TypeScript" },
      forkCount: 2,
      isExternal: false,
    },
    {
      name: "repo2",
      description: "description 2",
      url: "https://github.com/testuser/repo2",
      stargazerCount: 5,
      primaryLanguage: { name: "JavaScript" },
      forkCount: 1,
      isExternal: false,
    },
  ];

  describe("calculateImpactScore", () => {
    test("should calculate score based on stars, external PRs, and reviews", () => {
      // Stars (10+5) + (15 * 5) + (20 * 3) = 15 + 75 + 60 = 150
      const score = calculateImpactScore(mockUser, mockRepos);
      expect(score).toBe(150);
    });
  });

  describe("extractWorkPattern", () => {
    test("should return 'Maintainer' if total impact actions > 50", () => {
      const maintainerUser = { ...mockUser, externalContributions: 30, reviewsGiven: 21 };
      expect(extractWorkPattern(maintainerUser)).toBe("Maintainer");
    });

    test("should return 'Collaborator' if external contributions > 10", () => {
      const collaboratorUser = { ...mockUser, externalContributions: 11, reviewsGiven: 5 };
      expect(extractWorkPattern(collaboratorUser)).toBe("Collaborator");
    });

    test("should return 'Lone Wolf' otherwise", () => {
      const loneWolfUser = { ...mockUser, externalContributions: 5, reviewsGiven: 5 };
      expect(extractWorkPattern(loneWolfUser)).toBe("Lone Wolf");
    });
  });

  describe("analyzePortfolio integration", () => {
    test("should include impactScore and workPattern", () => {
      const result = analyzePortfolio(mockUser, mockRepos);
      expect(result.impactScore).toBe(150);
      expect(result.workPattern).toBe("Collaborator");
    });
  });
});

describe("analyzePortfolio legacy", () => {
  const mockUser: GitHubUser = {
    login: "testuser",
    name: "Test User",
    avatarUrl: "https://example.com/avatar.png",
    bio: "Test bio",
    url: "https://github.com/testuser",
    followers: 100,
    publicRepos: 10,
    contributionYears: [2023],
    externalContributions: 0,
    reviewsGiven: 0,
    contributionCalendar: [],
  };

  const mockRepos: GitHubRepository[] = [
    {
      name: "repo1",
      description: "description 1",
      url: "https://github.com/testuser/repo1",
      stargazerCount: 10,
      primaryLanguage: { name: "TypeScript" },
      forkCount: 2,
      isExternal: false,
    },
    {
      name: "repo2",
      description: "description 2",
      url: "https://github.com/testuser/repo2",
      stargazerCount: 5,
      primaryLanguage: { name: "JavaScript" },
      forkCount: 1,
      isExternal: false,
    },
    {
      name: "repo3",
      description: "description 3",
      url: "https://github.com/testuser/repo3",
      stargazerCount: 15,
      primaryLanguage: { name: "TypeScript" },
      forkCount: 3,
      isExternal: false,
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
