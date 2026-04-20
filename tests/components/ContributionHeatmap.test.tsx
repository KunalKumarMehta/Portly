/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContributionHeatmap } from '../../app/components/ContributionHeatmap';
import React from 'react';

const mockCalendar = [
  { date: '2023-01-01', contributionCount: 0, color: '#ebedf0' },
  { date: '2023-01-02', contributionCount: 5, color: '#9be9a8' },
  { date: '2023-01-03', contributionCount: 15, color: '#216e39' },
];

describe('ContributionHeatmap', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a grid of days', () => {
    render(<ContributionHeatmap calendar={mockCalendar} />);
    const days = screen.getAllByTestId('contribution-day');
    expect(days).toHaveLength(3);
  });

  it('displays tooltip text on hover', () => {
    render(<ContributionHeatmap calendar={mockCalendar} />);
    const day = screen.getByTitle('2023-01-02: 5 contributions');
    expect(day).toBeDefined();
  });

  it('applies background color from calendar data', () => {
    render(<ContributionHeatmap calendar={mockCalendar} />);
    const day = screen.getByTitle('2023-01-03: 15 contributions');
    expect(day.style.backgroundColor).toBe('rgb(33, 110, 57)'); // #216e39 in rgb
  });
});
