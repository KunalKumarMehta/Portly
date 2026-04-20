import type { GitHubUser, GitHubRepository, PortfolioAnalysis } from '../types/portfolio';

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
    topRepositories: repos.sort((a, b) => b.stargazerCount - a.stargazerCount).slice(0, 6),
    totalStars,
    topLanguages,
  };
}
