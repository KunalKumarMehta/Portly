import { useLoaderData } from '@tanstack/react-router';
// Implementation will use Tanstack Start createServerFn

export default function Portfolio() {
  // Mock loader usage for the plan
  const data = useLoaderData({ from: '/portfolio/$username' }) as any;
  return <div>Portfolio for {data?.user?.name || 'User'}</div>;
}