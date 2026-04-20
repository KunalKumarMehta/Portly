export interface GitHubUser {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
}

export interface GitHubRepository {
  name: string;
  description: string;
  stargazerCount: number;
  primaryLanguage: { name: string } | null;
  url: string;
}

export interface PortfolioAnalysis {
  user: GitHubUser;
  topRepositories: GitHubRepository[];
  totalStars: number;
  topLanguages: Record<string, number>;
}
