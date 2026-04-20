/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ImpactMetrics from '../../app/components/ImpactMetrics';

describe('ImpactMetrics', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    impactScore: 85,
    externalContributions: 12,
    reviewsGiven: 45,
    workPattern: 'Collaborator' as const,
  };

  it('displays the Impact Score prominently', () => {
    render(<ImpactMetrics {...defaultProps} />);
    expect(screen.getByText('Impact Score')).toBeDefined();
    expect(screen.getByText('85')).toBeDefined();
  });

  it('displays external contributions and reviews given', () => {
    render(<ImpactMetrics {...defaultProps} />);
    expect(screen.getByText('External Contributions')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('Reviews Given')).toBeDefined();
    expect(screen.getByText('45')).toBeDefined();
  });

  it('shows the correct work pattern badge', () => {
    render(<ImpactMetrics {...defaultProps} />);
    expect(screen.getByText('Collaborator')).toBeDefined();
  });

  it('renders different badges for different work patterns', () => {
    const { rerender } = render(<ImpactMetrics {...defaultProps} workPattern="Maintainer" />);
    expect(screen.getByText('Maintainer')).toBeDefined();

    rerender(<ImpactMetrics {...defaultProps} workPattern="Lone Wolf" />);
    expect(screen.getByText('Lone Wolf')).toBeDefined();
  });
});
