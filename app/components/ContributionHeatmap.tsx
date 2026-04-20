import React from 'react';
import type { ContributionDay } from '../types/portfolio';

interface ContributionHeatmapProps {
  calendar: ContributionDay[];
}

export function ContributionHeatmap({ calendar }: ContributionHeatmapProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h3 className="text-lg font-semibold mb-4">Contribution Activity</h3>
      <div className="flex flex-wrap gap-1">
        {calendar.map((day) => (
          <div
            key={day.date}
            data-testid="contribution-day"
            className="w-3 h-3 rounded-sm cursor-pointer transition-colors"
            style={{ backgroundColor: day.color }}
            title={`${day.date}: ${day.contributionCount} contributions`}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ebedf0' }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#9be9a8' }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#40c463' }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#30a14e' }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#216e39' }} />
        <span>More</span>
      </div>
    </div>
  );
}
