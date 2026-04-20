import { expect, test } from 'vitest';
import { analyzePortfolio } from '../../src/server/analyzer';

test('analyzes portfolio correctly', () => {
  const user = { login: 'test', name: 'Test', avatarUrl: '', bio: '' };
  const repos = [{ name: 'repo1', description: '', stargazerCount: 10, primaryLanguage: { name: 'TS' }, url: '' }];
  const result = analyzePortfolio(user, repos);
  expect(result.totalStars).toBe(10);
});
