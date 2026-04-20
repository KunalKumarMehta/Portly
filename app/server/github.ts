import type { GitHubUser, GitHubRepository } from '../types/portfolio';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const USER_QUERY = `
  query($login: String!) {
    user(login: $login) {
      login
      name
      bio
      avatarUrl
      url
      followers {
        totalCount
      }
      repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
        totalCount
        nodes {
          name
          description
          stargazerCount
          forkCount
          primaryLanguage { name }
          url
          isInOrganization
        }
      }
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
        totalPullRequestContributions
        totalPullRequestReviewContributions
      }
    }
  }
`;

async function fetchGraphQL(query: string, variables: any) {
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API Error: ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL Error: ${json.errors.map((e: any) => e.message).join(', ')}`);
  }

  return json.data;
}

export async function fetchGitHubProfile(username: string): Promise<GitHubUser> {
  const data = await fetchGraphQL(USER_QUERY, { login: username });
  
  if (!data.user) {
    throw new Error('User not found');
  }

  const { user } = data;
  const contributionCalendar = user.contributionsCollection.contributionCalendar.weeks
    .flatMap((week: any) => week.contributionDays);

  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    followers: user.followers.totalCount,
    publicRepos: user.repositories.totalCount,
    url: user.url,
    contributionYears: [], // Will be filled by other logic if needed, for now empty
    externalContributions: user.contributionsCollection.totalPullRequestContributions,
    reviewsGiven: user.contributionsCollection.totalPullRequestReviewContributions,
    contributionCalendar,
  };
}

export async function fetchUserRepositories(username: string): Promise<GitHubRepository[]> {
  const data = await fetchGraphQL(USER_QUERY, { login: username });
  
  if (!data.user) {
    throw new Error('User not found');
  }

  return data.user.repositories.nodes.map((repo: any) => ({
    name: repo.name,
    description: repo.description,
    stargazerCount: repo.stargazerCount,
    forkCount: repo.forkCount,
    primaryLanguage: repo.primaryLanguage,
    url: repo.url,
    isExternal: repo.isInOrganization,
  }));
}
