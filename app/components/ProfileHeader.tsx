import React from 'react';
import type { GitHubUser } from '../types/portfolio';

export function ProfileHeader({ user }: { user: GitHubUser }) {
  return (
    <header className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-lg shadow">
      <img src={user.avatarUrl} alt={user.login} className="w-24 h-24 rounded-full shadow-md" />
      <div className="text-center md:text-left">
        <h1 className="text-2xl font-bold text-gray-900">{user.name || user.login}</h1>
        <p className="text-gray-600 mt-2">{user.bio}</p>
        <div className="flex gap-4 mt-4 justify-center md:justify-start">
          <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">👥 {user.followers} followers</span>
          <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">📝 {user.publicRepos} repos</span>
        </div>
      </div>
    </header>
  );
}
