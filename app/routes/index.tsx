import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Portly</h1>
      <p>Generate an outstanding portfolio from your GitHub profile.</p>
      <form onSubmit={(e) => { 
        e.preventDefault(); 
        if (username.trim()) {
          navigate({ to: `/portfolio/${username}` }); 
        }
      }}>
        <input 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="GitHub Username" 
          required 
          style={{ padding: '0.5rem', fontSize: '1rem', marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>Generate</button>
      </form>
    </div>
  );
}
