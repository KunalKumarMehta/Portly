export interface GitHubUser {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  publicRepos: number;
  url: string;
}

export interface GitHubRepository {
  name: string;
  description: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string } | null;
  url: string;
}

export interface PortfolioAnalysis {
  user: GitHubUser;
  topRepositories: GitHubRepository[];
  totalStars: number;
  topLanguages: Record<string, number>;
}
