import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { fetchGitHubProfile, fetchUserRepositories } from '../../server/github';
import { analyzePortfolio } from '../../server/analyzer';
import type { PortfolioAnalysis } from '../../types/portfolio';
import { ProfileHeader } from '../../components/ProfileHeader';
import { SkillsSection } from '../../components/SkillsSection';
import { ProjectGrid } from '../../components/ProjectGrid';

export const Route = createFileRoute('/portfolio/$username')({
  component: Portfolio,
});

function Portfolio() {
  const { username } = Route.useParams();
  const [data, setData] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [profile, repos] = await Promise.all([
          fetchGitHubProfile(username),
          fetchUserRepositories(username)
        ]);
        
        const analysis = analyzePortfolio(profile, repos);
        if (mounted) setData(analysis);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load portfolio');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [username]);

  if (loading) return <div className="p-8 text-center text-gray-500">Analyzing GitHub Profile for {username}...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-8 text-center">No data found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <ProfileHeader user={data.user} />
      <SkillsSection languages={data.topLanguages} />
      <ProjectGrid repos={data.topRepositories} />
    </div>
  );
}
