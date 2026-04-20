import React from 'react';
import type { GitHubRepository } from '../types/portfolio';

export function ProjectGrid({ repos }: { repos: GitHubRepository[] }) {
  if (!repos.length) return <p className="text-gray-500 mt-4">No projects found.</p>;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map(repo => (
          <a key={repo.name} href={repo.url} target="_blank" rel="noreferrer" className="block p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-blue-600 truncate">{repo.name}</h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2 min-h-[2.5rem]">{repo.description || 'No description provided.'}</p>
            <div className="flex gap-4 mt-4 text-sm text-gray-500">
              {repo.primaryLanguage && <span className="flex items-center gap-1">🔵 {repo.primaryLanguage.name}</span>}
              <span className="flex items-center gap-1">⭐ {repo.stargazerCount}</span>
              <span className="flex items-center gap-1">🔄 {repo.forkCount}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
