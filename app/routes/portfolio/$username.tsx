import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { fetchGitHubProfile } from '../../server/github';

export const Route = createFileRoute('/portfolio/$username')({
  component: Portfolio,
});

function Portfolio() {
  const { username } = Route.useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        // Using the client-side fetcher since SSR is disabled
        const profile = await fetchGitHubProfile(username);
        if (mounted) setData(profile);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load portfolio');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [username]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Analyzing GitHub Profile for {username}...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: '2rem', textAlign: 'center' }}>No data found.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        {data.avatar_url && <img src={data.avatar_url} alt={username} style={{ width: '100px', borderRadius: '50%' }} />}
        <div>
          <h1>{data.name || username}</h1>
          <p>{data.bio}</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>👥 {data.followers} followers</span>
            <span>📝 {data.public_repos} repos</span>
          </div>
        </div>
      </header>
      
      <main style={{ marginTop: '2rem' }}>
        <h2>Outstanding Portfolio Highlights</h2>
        <p><i>(Analysis engine integration pending. Displaying raw data for now.)</i></p>
        <pre style={{ background: '#f4f4f4', padding: '1rem', overflowX: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </main>
    </div>
  );
}
