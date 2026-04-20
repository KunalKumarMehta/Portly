import type { GitHubUser, GitHubRepository, PortfolioAnalysis } from '../types/portfolio';

export function calculateImpactScore(user: GitHubUser, repos: GitHubRepository[]): number {
  const repoStars = repos.reduce((sum, r) => sum + r.stargazerCount, 0);
  return repoStars + (user.externalContributions * 5) + (user.reviewsGiven * 3);
}

export function extractWorkPattern(user: GitHubUser): PortfolioAnalysis['workPattern'] {
  const totalImpactActions = user.externalContributions + user.reviewsGiven;
  if (totalImpactActions > 50) return 'Maintainer';
  if (user.externalContributions > 10) return 'Collaborator';
  return 'Lone Wolf';
}

export function analyzePortfolio(user: GitHubUser, repos: GitHubRepository[]): PortfolioAnalysis {
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazerCount || 0), 0);
  const topLanguages = repos.reduce((acc, repo) => {
    if (repo.primaryLanguage) {
      acc[repo.primaryLanguage.name] = (acc[repo.primaryLanguage.name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    user,
    topRepositories: [...repos].sort((a, b) => b.stargazerCount - a.stargazerCount).slice(0, 6),
    totalStars,
    topLanguages,
    impactScore: calculateImpactScore(user, repos),
    workPattern: extractWorkPattern(user),
  };
}
