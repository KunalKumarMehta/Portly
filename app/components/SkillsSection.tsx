import React from 'react';

export function SkillsSection({ languages }: { languages: Record<string, number> }) {
  const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Languages</h2>
      <div className="flex flex-wrap gap-2">
        {sorted.map(([lang, count]) => (
          <div key={lang} className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg shadow-sm flex items-center gap-2">
            <span className="font-medium text-gray-800">{lang}</span>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
