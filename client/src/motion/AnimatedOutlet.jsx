import { useOutlet } from 'react-router-dom';

export default function AnimatedOutlet({ className = '' }) {
  const outlet = useOutlet();
  if (!outlet) return null;
  return <div className={className}>{outlet}</div>;
}
