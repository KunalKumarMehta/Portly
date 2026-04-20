import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

export default function Home() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  return (
    <form onSubmit={(e) => { e.preventDefault(); navigate({ to: `/portfolio/${username}` }); }}>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="GitHub Username" required />
      <button type="submit">Generate Portfolio</button>
    </form>
  );
}
