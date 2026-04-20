import { describe, it, expect } from 'vitest';
import { Route } from '../../app/routes/__root';

describe('Root Route', () => {
  it('should export a Route', () => {
    expect(Route).toBeDefined();
  });
});
