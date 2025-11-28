import { useNavigate } from 'react-router-dom';
import { TraditionalWebsite } from '../components/TraditionalWebsite';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <TraditionalWebsite onForward={() => navigate('/portfolio')} />
    </div>
  );
}
