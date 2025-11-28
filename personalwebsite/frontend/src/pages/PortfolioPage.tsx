import { useNavigate } from 'react-router-dom';
import { RAGPortfolio } from '../components/RAGPortfolio';

export function PortfolioPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleExit = () => {
    navigate('/');
  };

  return <RAGPortfolio onBack={handleBack} onExit={handleExit} />;
}


