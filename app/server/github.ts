import type { GitHubUser, GitHubRepository } from '../types/portfolio';

export async function fetchGitHubProfile(username: string): Promise<GitHubUser> {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('User not found');
    throw new Error('GitHub API Error');
  }
  const data = await res.json();
  return {
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    followers: data.followers,
    publicRepos: data.public_repos,
    url: data.html_url
  };
}

export async function fetchUserRepositories(username: string): Promise<GitHubRepository[]> {
  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`);
  if (!res.ok) throw new Error('Failed to fetch repositories');
  const data = await res.json();
  return data.map((repo: any) => ({
    name: repo.name,
    description: repo.description,
    stargazerCount: repo.stargazers_count,
    forkCount: repo.forks_count,
    primaryLanguage: repo.language ? { name: repo.language } : null,
    url: repo.html_url
  }));
}
