import { expect, test } from 'vitest';
import { fetchGitHubProfile } from '../../src/server/github';

test('fetchGitHubProfile handles 404', async () => {
  await expect(fetchGitHubProfile('invalid-user-1234567890')).rejects.toThrow('User not found');
});
