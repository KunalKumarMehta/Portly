import type { GitHubUser, GitHubRepository } from '../types/portfolio';

export async function fetchGitHubProfile(username: string): Promise<GitHubUser> {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('User not found');
    throw new Error('GitHub API Error');
  }
  return res.json();
}
