import { describe, it, expect } from 'vitest';
import { GitHubUser, GitHubRepository, PortfolioAnalysis, ContributionDay } from '../../app/types/portfolio';

describe('Portfolio Types', () => {
  it('should allow valid ContributionDay', () => {
    const day: ContributionDay = {
      date: '2023-01-01',
      contributionCount: 5,
      color: '#ebedf0'
    };
    expect(day.date).toBe('2023-01-01');
  });

  it('should allow valid GitHubUser', () => {
    const user: GitHubUser = {
      login: 'testuser',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
      bio: 'Bio',
      followers: 10,
      publicRepos: 5,
      url: 'https://github.com/testuser',
      contributionYears: [2023, 2024],
      externalContributions: 50,
      reviewsGiven: 20,
      contributionCalendar: [{ date: '2023-01-01', contributionCount: 5, color: '#ebedf0' }]
    };
    expect(user.login).toBe('testuser');
  });

  it('should allow valid GitHubRepository', () => {
    const repo: GitHubRepository = {
      name: 'test-repo',
      description: 'A test repo',
      stargazerCount: 100,
      forkCount: 20,
      primaryLanguage: { name: 'TypeScript' },
      url: 'https://github.com/testuser/test-repo',
      isExternal: false
    };
    expect(repo.name).toBe('test-repo');
  });

  it('should allow valid PortfolioAnalysis', () => {
    const analysis: PortfolioAnalysis = {
      user: {
        login: 'testuser',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        bio: 'Bio',
        followers: 10,
        publicRepos: 5,
        url: 'https://github.com/testuser',
        contributionYears: [2023],
        externalContributions: 10,
        reviewsGiven: 5,
        contributionCalendar: []
      },
      topRepositories: [],
      totalStars: 100,
      topLanguages: { 'TypeScript': 80 },
      impactScore: 75,
      workPattern: 'Collaborator'
    };
    expect(analysis.impactScore).toBe(75);
    expect(analysis.workPattern).toBe('Collaborator');
  });
});
