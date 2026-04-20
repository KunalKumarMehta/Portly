/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReactNode } from 'react';
import { Route } from '../../app/routes/portfolio/$username';
import * as github from '../../app/server/github';
import * as analyzer from '../../app/server/analyzer';
import { PortfolioAnalysis } from '../../app/types/portfolio';

// Mock the components used in Portfolio
vi.mock('../../app/components/ProfileHeader', () => ({
  ProfileHeader: () => <div data-testid="profile-header">Profile Header</div>,
}));
vi.mock('../../app/components/ImpactMetrics', () => ({
  default: () => <div data-testid="impact-metrics">Impact Metrics</div>,
}));
vi.mock('../../app/components/ContributionHeatmap', () => ({
  ContributionHeatmap: () => <div data-testid="contribution-heatmap">Contribution Heatmap</div>,
}));
vi.mock('../../app/components/SkillsSection', () => ({
  SkillsSection: () => <div data-testid="skills-section">Skills Section</div>,
}));
vi.mock('../../app/components/ProjectGrid', () => ({
  ProjectGrid: () => <div data-testid="project-grid">Project Grid</div>,
}));

// Mock the router params
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    createFileRoute: () => (config: any) => ({
      ...config,
      useParams: () => ({ username: 'testuser' }),
    }),
  };
});

describe('Portfolio Component', () => {
  it('renders loading state initially', async () => {
    vi.spyOn(github, 'fetchGitHubProfile').mockReturnValue(new Promise(() => {}));
    vi.spyOn(github, 'fetchUserRepositories').mockReturnValue(new Promise(() => {}));

    render(<Route.component />);
    expect(screen.getByText(/Analyzing GitHub Profile for testuser/i)).toBeDefined();
  });

  it('renders portfolio data after successful fetch', async () => {
    const mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
      bio: 'Test bio',
      followers: 10,
      publicRepos: 5,
      url: 'https://github.com/testuser',
      externalContributions: 5,
      reviewsGiven: 3,
      contributionCalendar: []
    };

    const mockRepos = [
      {
        name: 'test-repo',
        description: 'A test repo',
        stargazerCount: 5,
        forkCount: 2,
        primaryLanguage: { name: 'TypeScript' },
        url: 'https://github.com/testuser/test-repo',
        isExternal: false
      }
    ];

    const mockAnalysis: PortfolioAnalysis = {
      user: mockProfile,
      topRepositories: mockRepos,
      totalStars: 5,
      topLanguages: { TypeScript: 100 },
      impactScore: 50,
      workPattern: 'Lone Wolf'
    };

    vi.spyOn(github, 'fetchGitHubProfile').mockResolvedValue(mockProfile);
    vi.spyOn(github, 'fetchUserRepositories').mockResolvedValue(mockRepos);
    vi.spyOn(analyzer, 'analyzePortfolio').mockReturnValue(mockAnalysis);

    render(<Route.component />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-header')).toBeDefined();
    }, { timeout: 2000 });

    expect(screen.getByTestId('impact-metrics')).toBeDefined();
    expect(screen.getByTestId('contribution-heatmap')).toBeDefined();
    expect(screen.getByTestId('skills-section')).toBeDefined();
    expect(screen.getByTestId('project-grid')).toBeDefined();
  });

  it('renders error state when fetch fails', async () => {
    vi.spyOn(github, 'fetchGitHubProfile').mockRejectedValue(new Error('GitHub API Error'));
    vi.spyOn(github, 'fetchUserRepositories').mockResolvedValue([]);

    render(<Route.component />);

    await waitFor(() => {
      expect(screen.getByText(/Error: GitHub API Error/i)).toBeDefined();
    });
  });
});
