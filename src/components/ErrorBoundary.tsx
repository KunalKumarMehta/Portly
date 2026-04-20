export function ErrorBoundary({ error }: { error: Error }) {
  if (error.message.includes('not found')) return <div>GitHub User not found</div>;
  return <div>Something went wrong: {error.message}</div>;
}
