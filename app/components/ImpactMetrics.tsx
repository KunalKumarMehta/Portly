import React from 'react';

type WorkPattern = 'Collaborator' | 'Maintainer' | 'Lone Wolf';

interface ImpactMetricsProps {
  impactScore: number;
  externalContributions: number;
  reviewsGiven: number;
  workPattern: WorkPattern;
}

const ImpactMetrics: React.FC<ImpactMetricsProps> = ({
  impactScore,
  externalContributions,
  reviewsGiven,
  workPattern,
}) => {
  const getBadgeColor = (pattern: WorkPattern) => {
    switch (pattern) {
      case 'Collaborator':
        return 'bg-blue-100 text-blue-800';
      case 'Maintainer':
        return 'bg-green-100 text-green-800';
      case 'Lone Wolf':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Impact Score</h3>
          <p className="text-4xl font-bold text-indigo-600 mt-1">{impactScore}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColor(workPattern)}`}>
          {workPattern}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-xs text-gray-500 uppercase">External Contributions</p>
          <p className="text-xl font-semibold text-gray-900">{externalContributions}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-xs text-gray-500 uppercase">Reviews Given</p>
          <p className="text-xl font-semibold text-gray-900">{reviewsGiven}</p>
        </div>
      </div>
    </div>
  );
};

export default ImpactMetrics;
