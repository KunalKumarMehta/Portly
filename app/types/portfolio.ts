export interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  publicRepos: number;
  url: string;
  contributionYears: number[];
  externalContributions: number;
  reviewsGiven: number;
  contributionCalendar: ContributionDay[];
}

export interface GitHubRepository {
  name: string;
  description: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string } | null;
  url: string;
  isExternal: boolean;
}

export interface PortfolioAnalysis {
  user: GitHubUser;
  topRepositories: GitHubRepository[];
  totalStars: number;
  topLanguages: Record<string, number>;
  impactScore: number;
  workPattern: 'Lone Wolf' | 'Collaborator' | 'Maintainer';
}
